import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../../shared";
import { ProposalController } from './controllers/proposal.controller';
import { ProposalRepository } from './repositories/proposal.repository';
import { ProposalService } from './services/proposal.service';

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([ProposalRepository]),
      HttpModule,
      ConfigModule,
    ],
    providers: [ProposalService],
    controllers: [ProposalController],
    exports: [ProposalService],
  })
  export class ProposalModule {}