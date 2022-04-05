import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../../shared";
import { BlockRepository } from '../block/repositories/block.repository';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalVoteRepository } from './repositories/proposal-vote.repository';
import { ProposalRepository } from './repositories/proposal.repository';
import { ProposalService } from './services/proposal.service';

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([ProposalRepository, BlockRepository, ProposalVoteRepository]),
      HttpModule,
      ConfigModule,
    ],
    providers: [ProposalService],
    controllers: [ProposalController],
    exports: [ProposalService],
  })
  export class ProposalModule {}