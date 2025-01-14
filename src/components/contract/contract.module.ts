import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from '../../shared';
import { ContractController } from './controllers/contract.controller';
import { SmartContractRepository } from './repositories/smart-contract.repository';
import { ContractService } from './services/contract.service';
import { ConfigModule } from '@nestjs/config';
import { TagRepository } from './repositories/tag.repository';
import { HttpModule } from '@nestjs/axios';
import { SmartContractCodeRepository } from '../contract-code/repositories/smart-contract-code.repository';
import { TokenMarketsRepository } from '../cw20-token/repositories/token-markets.repository';
import { SoulboundTokenRepository } from '../soulbound-token/repositories/soulbound-token.repository';
import { VerifyCodeStepRepository } from './repositories/verify-code-step.repository';
import { ContractUtil } from '../../shared/utils/contract.util';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      SmartContractRepository,
      TagRepository,
      SmartContractCodeRepository,
      TokenMarketsRepository,
      SoulboundTokenRepository,
      VerifyCodeStepRepository,
    ]),
    ConfigModule,
    HttpModule,
  ],
  providers: [ContractService, ServiceUtil, ContractUtil],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule {}
