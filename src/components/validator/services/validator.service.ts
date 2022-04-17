import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { lastValueFrom } from 'rxjs';
import { BlockRepository } from '../../../components/block/repositories/block.repository';
import { DelegationRepository } from '../../../components/schedule/repositories/delegation.repository';
import { BlockService } from '../../../components/block/services/block.service';

import { AkcLogger, CONST_NUM, RequestContext } from '../../../shared';
import { DelegationParamsDto } from '../dtos/delegation-params.dto';

import { ValidatorOutput } from '../dtos/validator-output.dto';
import { ValidatorRepository } from '../repositories/validator.repository';
import { ProposalRepository } from '../../../components/proposal/repositories/proposal.repository';
import { ProposalVoteRepository } from '../../../components/proposal/repositories/proposal-vote.repository';
import { LiteValidatorOutput } from '../dtos/lite-validator-output.dto';
import { DelegationOutput } from '../dtos/delegation-output.dto';
import { DelegatorOutput } from '../dtos/delegator-output';
import console from 'console';

@Injectable()
export class ValidatorService {
  cosmosScanAPI: string;
  api: string;

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private blockService: BlockService,
    private validatorRepository: ValidatorRepository,
    private delegationRepository: DelegationRepository,
    private blockRepository: BlockRepository,
    private proposalRepository: ProposalRepository,
    private proposalVoteRepository: ProposalVoteRepository,
  ) {
    this.logger.setContext(ValidatorService.name);
    this.cosmosScanAPI = this.configService.get<string>('cosmosScanAPI');
    this.api = this.configService.get<string>('node.api');
  }

  async getDataAPI(api, params, ctx) {
    this.logger.log(
      ctx,
      `${this.getDataAPI.name} was called, to ${api + params}!`,
    );
    try {
      const data = await lastValueFrom(this.httpService.get(api + params)).then(
        (rs) => rs.data,
      );
      return data;

    } catch (err) {
      return null;
    }

  }

  async getTotalValidator(): Promise<number> {
    return await this.validatorRepository.count();
  }

  async getTotalValidatorActive(): Promise<number> {
    return await this.validatorRepository.count({ where: { jailed: '0' } });
  }

  async getValidators(ctx: RequestContext
  ): Promise<{ validators: LiteValidatorOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidators.name} was called!`);

    // get all validator
    const [validatorsRes, count] = await this.validatorRepository.findAndCount({
      order: { power: 'DESC' },
    });

    const validatorsOutput = plainToClass(LiteValidatorOutput, validatorsRes, {
      excludeExtraneousValues: true,
    });

    // get 50 proposals
    const countProposal = await this.proposalRepository.count({
      order: { pro_id: 'DESC' },
      take: CONST_NUM.LIMIT_50,
      skip: CONST_NUM.OFFSET,
    });

    let cntValidatorActive = 0;
    const validatorActive = validatorsOutput.filter(e => e.jailed !== '0');
    for (let key in validatorActive) {
      const data = validatorActive[key];
      const dataBefore = validatorActive[parseInt(key) - 1];
      if (parseInt(key) === 0) {
        data.cumulative_share_before = '0.00';
        data.cumulative_share = data.percent_power;
        data.cumulative_share_after = data.percent_power;
      } else {
        data.cumulative_share_before = dataBefore.cumulative_share_after;
        data.cumulative_share = data.percent_power;
        const cumulative = parseFloat(data.cumulative_share_before) + parseFloat(data.percent_power);
        data.cumulative_share_after = cumulative.toFixed(2);
      }
    }
    for (let key in validatorsOutput) {
      const data = validatorsOutput[key];
      data.rank = parseInt(key) + 1;
      data.target_count = countProposal;
      if (data.jailed === '0') {
        data.status_validator = true;
        cntValidatorActive = cntValidatorActive + 1;
      } else {
        data.status_validator = false;
      }

      // get count proposal vote by address
      const countVotes = await this.proposalVoteRepository.count({
        where: { voter: data.acc_address },
      });
      data.vote_count = countVotes;
    }

    return { validators: validatorsOutput, count };
  }

  async getValidatorByAddress(ctx: RequestContext, address): Promise<any> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const validator = await this.validatorRepository.getRankByAddress(address);

    const validatorOutput = plainToClass(ValidatorOutput, validator, {
      excludeExtraneousValues: true,
    });

    const blockFirst = await this.blockRepository.find({
      where: { operator_address: address },
      order: { height: 'ASC' },
      take: 1,
      skip: 0,
    });

    if (blockFirst.length > 0) {
      validatorOutput.bonded_height = blockFirst[0].height;
    }

    return validatorOutput;
  }

  async getDelegationByAddress(
    ctx: RequestContext,
    validatorAddress,
    query: DelegationParamsDto,
  ): Promise<{ delegations: DelegationOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getValidatorByAddress.name} was called!`);

    const [delegations, count] = await this.delegationRepository.findAndCount({
      where: { validator_address: validatorAddress },
      order: { amount: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    const delegationsOutput = plainToClass(DelegationOutput, delegations, {
      excludeExtraneousValues: true,
    });

    return { delegations: delegationsOutput, count };
  }

  async getDelegations(
    ctx: RequestContext,
    delegatorAddress: string
  ): Promise<any> {
    this.logger.log(ctx, `${this.getDelegations.name} was called!`);
    const api = this.configService.get<string>('node.api');
    let result: any = {};
    //get available balance
    const paramsBalance = `/cosmos/bank/v1beta1/balances/${delegatorAddress}`;
    const balanceData = await this.getDataAPI(api, paramsBalance, ctx);
    result.available_balance = 0;
    if (balanceData && balanceData?.balances && balanceData?.balances?.length > 0) {
      result.available_balance = balanceData.balances[0].amount;
    }
    //get delegations
    const paramsDelegated = `/cosmos/staking/v1beta1/delegations/${delegatorAddress}`;
    const delegatedData = await this.getDataAPI(api, paramsDelegated, ctx);
    //get rewards
    const paramsReward = `/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`;
    const rewardData = await this.getDataAPI(api, paramsReward, ctx);
    let delegations: any = [];
    if (delegatedData && delegatedData?.delegation_responses && delegatedData?.delegation_responses.length > 0) {
      const delegationsData = delegatedData.delegation_responses;
      for (let i = 0; i < delegationsData.length; i++) {
        let delegation: any = {};
        let item = delegationsData[i];
        delegation.amount_staked = item.balance.amount;
        delegation.validator_address = item.delegation.validator_address;
        delegation.pending_reward = 0;
        if (rewardData && rewardData?.rewards && rewardData?.rewards.length > 0) {
          const findReward = rewardData.rewards.find(i => i.validator_address === item.delegation.validator_address);
          if (findReward && findReward.reward.length > 0) {
            //set reward for item
            delegation.pending_reward = findReward.reward[0].amount;
          }
        }
        delegation.validator_name = '';
        const validator = await this.validatorRepository.findOne({
          where: { operator_address: item.delegation.validator_address },
        });
        if (validator) {
          //set name for item
          delegation.validator_name = validator.title;
        }
        delegations.push(delegation);
      }
    }
    result.delegations = delegations;

    return result;
  }

  /**
   * getDelegators
   * @param delegatorAddr 
   */
  async getDelegators(delegatorAddress: string) {
    const delegators = await this.validatorRepository.getDelegators(delegatorAddress);
    if (delegators.length > 0) {
      const delegatorOutputs = plainToClass(DelegatorOutput, delegators, {
        excludeExtraneousValues: true,
      });

      return { data: delegatorOutputs };
    }
    return { data: [] };
  }
}
