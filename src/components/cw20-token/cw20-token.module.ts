import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SharedModule } from '../../shared';
import { Cw20TokenController } from './controllers/cw20-token.controller';
import { Cw20TokenService } from './services/cw20-token.service';
import { SmartContractRepository } from '../contract/repositories/smart-contract.repository';
import { RedisUtil } from '../../shared/utils/redis.util';
import { AccountService } from '../account/services/account.service';
import { ValidatorRepository } from '../validator/repositories/validator.repository';
import { TokenMarketsRepository } from './repositories/token-markets.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      SmartContractRepository,
      TokenMarketsRepository,
      ValidatorRepository,
    ]),
    ConfigModule,
    HttpModule,
  ],
  providers: [Cw20TokenService, ServiceUtil, RedisUtil, AccountService],
  controllers: [Cw20TokenController],
  exports: [Cw20TokenService],
})
export class Cw20TokenModule {}
