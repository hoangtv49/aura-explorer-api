import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AkcLoggerModule, QUEUES } from 'src/shared';
import { CW4973Processor } from './cw4973.processor';
import { ServiceUtil } from 'src/shared/utils/service.util';
import { HttpModule } from '@nestjs/axios';
import { SoulboundTokenRepository } from 'src/components/soulbound-token/repositories/soulbound-token.repository';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QUEUES.CW4973.QUEUE_NAME,
    }),
    AkcLoggerModule,
    HttpModule,
  ],
  providers: [CW4973Processor, ServiceUtil, SoulboundTokenRepository],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.SEND_MAIL.QUEUE_NAME,
    }),
  ],
})
export class CW4973QueueModule {}
