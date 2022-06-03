import { Injectable } from "@nestjs/common";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Like, MoreThan, Not } from "typeorm";
import { AkcLogger, CONTRACT_STATUS, ERROR_MAP, RequestContext } from "../../../shared";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { ContractRepository } from "../repositories/contract.repository";
import { ConfigService } from "@nestjs/config";
import { TagRepository } from "../repositories/tag.repository";
import { VerifyContractParamsDto } from "../dtos/verify-contract-params.dto";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { SearchTransactionParamsDto } from "../dtos/search-transaction-params.dto";
import { TokenContractRepository } from "../repositories/token-contract.repository";

@Injectable()
export class ContractService {
  private api;
  private verifyContractUrl;

  constructor(
    private readonly logger: AkcLogger,
    private contractRepository: ContractRepository,
    private tagRepository: TagRepository,
    private tokenContractRepository: TokenContractRepository,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.logger.setContext(ContractService.name);
    this.api = this.configService.get('API');
    this.verifyContractUrl = this.configService.get('VERIFY_CONTRACT_URL');
  }

  async getContracts(ctx: RequestContext, request: ContractParamsDto): Promise<any> {
    this.logger.log(ctx, `${this.getContracts.name} was called!`);
    const [contracts, count] = await this.contractRepository.findAndCount({
      where: {
        id: MoreThan(0),
        ...(request?.keyword && { contract_name: Like(`%${request.keyword}%`) })
      },
      order: { updated_at: 'DESC' },
      take: request.limit,
      skip: request.offset,
    });

    return { contracts: contracts, count };
  }

  async getContractByAddress(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    let contract: any = null;
    const contractData = await this.contractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    if (contractData) {
      contract = contractData;
      const codeId = contractData.code_id;
      const balanceParams = `cosmos/bank/v1beta1/balances/${contractAddress}`;
      const [
        balanceData
      ] = await Promise.all([
        this.serviceUtil.getDataAPI(this.api, balanceParams, ctx)
      ]);
      contract.balance = 0;
      if (balanceData && balanceData?.balances && balanceData?.balances?.length > 0) {
        contract.balance = Number(balanceData.balances[0].amount);
      }
      contract.token_tracker = null;
      const tokenTracker = await this.tokenContractRepository.findOne({
        where: { contract_address: contractAddress }
      });
      if (tokenTracker) {
        contract.token_tracker = tokenTracker;
      }
    }
    return contract;
  }

  async getTagByAddress(ctx: RequestContext, accountAddress: string, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getTagByAddress.name} was called!`);
    const tag = this.tagRepository.findOne({
      where: { account_address: accountAddress, contract_address: contractAddress }
    });

    return tag;
  }

  async verifyContract(ctx: RequestContext, request: VerifyContractParamsDto): Promise<any> {
    this.logger.log(ctx, `${this.verifyContract.name} was called!`);
    const contract = await this.contractRepository.findOne({
      where: { contract_address: request.contract_address }
    });
    if (!contract || (contract && contract.contract_verification !== CONTRACT_STATUS.UNVERIFIED)) {
      const error = {
        Code: ERROR_MAP.CONTRACT_VERIFIED.Code,
        Message: ERROR_MAP.CONTRACT_VERIFIED.Message
      };
      return error;
    }
    const properties = {
      commit: request.url.split('/').pop(),
      compilerVersion: request.compiler_version,
      contractAddress: request.contract_address,
      contractUrl: request.url

    }
    const result = await lastValueFrom(this.httpService.post(this.verifyContractUrl, properties)).then(
      (rs) => rs.data,
    );

    return result;
  }

  async getContractsMatchCreationCode(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getContractsMatchCreationCode.name} was called!`);
    const contract = await this.contractRepository.findOne({
      where: { contract_address: contractAddress }
    });
    let contracts = [];
    let count = 0;
    if (contract) {
      const contractHash = contract.contract_hash;
      [contracts, count] = await this.contractRepository.findAndCount({
        where: {
          contract_address: Not(contractAddress),
          contract_hash: contractHash
        },
        order: { updated_at: 'DESC' }
      });
    }

    return { contracts: contracts, count };
  }
}