import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared';
import { ServiceUtil } from '../../shared/utils/service.util';
import { SmartContractRepository } from '../contract/repositories/smart-contract.repository';
import { Cw721TokenController } from './controllers/cw721-token.controller';
import { Cw721TokenService } from './services/cw721-token.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([SmartContractRepository]),
    ConfigModule,
    HttpModule,
  ],
  providers: [Cw721TokenService, ServiceUtil],
  controllers: [Cw721TokenController],
  exports: [Cw721TokenService],
})
export class Cw721TokenModule {}
