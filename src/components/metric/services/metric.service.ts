import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDBClient } from '../../../components/schedule/services/influxdb-client';
import { AkcLogger, RequestContext } from '../../../shared';
import { BlockRepository } from '../../block/repositories/block.repository';
import { TransactionRepository } from '../../transaction/repositories/transaction.repository';
import { ValidatorRepository } from '../../validator/repositories/validator.repository';
import { MetricOutput } from '../dtos/metric-output.dto';
import { Range } from '../utils/enum';
import {
  buildCondition,
  generateSeries,
  mergeByProperty
} from '../utils/utils';

@Injectable()
export class MetricService {
  influxDbClient: InfluxDBClient;

  constructor(
    private readonly logger: AkcLogger,
    private configService: ConfigService,
  ) {
    this.logger.setContext(MetricService.name);
    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );
    this.influxDbClient.initQueryApi();
  }

  async getBlock(ctx: RequestContext, range: Range): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getBlock.name} was called!`);
    this.logger.log(ctx, `calling ${BlockRepository.name}.createQueryBuilder`);

    return await this.queryInfluxDb(range, 'blocks');
  }

  async getTransaction(
    ctx: RequestContext,
    range: Range,
    timezone: number
  ): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getTransaction.name} was called!`);
    this.logger.log(
      ctx,
      `calling ${TransactionRepository.name}.createQueryBuilder`,
    );

    // Create start, stop position to get data fron influxdb
    let stop = new Date();
    const currentMinutes = stop.getMinutes();
    timezone = timezone * (-1);
    stop.setSeconds(0, 0);
    const hours = (timezone > 0) ? Math.round(timezone / 60) : 0;

    let start: Date = new Date();
    let queryStep = ``;
    if (range === Range.minute) {
      start.setMinutes(-60);
      queryStep = `1m`;

    } else {
      stop.setMinutes(timezone);
      stop.setMinutes(stop.getMinutes() + currentMinutes);

      start.setMinutes(timezone);
      start.setMinutes(start.getMinutes() + currentMinutes);

      switch (range) {
        case Range.month:
          start.setMonth(-12);
          start.setUTCHours(0, 0, 0, 0);
          queryStep = `1mo`;
          break;
        case Range.day:
          start.setDate(-30);
          start.setUTCHours(0, 0, 0, 0);
          queryStep = `1d`;
          break;
        case Range.hour:
          start.setHours(-24);
          start.setSeconds(0, 0);
          queryStep = `1h`;
          break;
      }
    }

    let results: MetricOutput[] = await this.influxDbClient.sumData('blocks_measurement', start.toISOString(), stop.toISOString(), queryStep, 'num_txs', timezone) as MetricOutput[];
    const series = generateSeries(range, hours);
    const metricData = mergeByProperty(results, series);    
    return metricData.map((item) => {
      const date = new Date(item.timestamp.replace('Z', ''));
      date.setHours(date.getHours() + hours);
      return { total: item.total, timestamp: date.toISOString().replace('Z', '') }
    });

  }

  async getValidator(
    ctx: RequestContext,
    range: Range,
  ): Promise<MetricOutput[]> {
    this.logger.log(ctx, `${this.getValidator.name} was called!`);
    this.logger.log(
      ctx,
      `calling ${ValidatorRepository.name}.createQueryBuilder`,
    );

    return await this.queryInfluxDb(range, 'validators');
  }

  private async queryInfluxDb(
    range: Range,
    measurement: string,
  ): Promise<MetricOutput[]> {
    const { amount, step, fluxType } = buildCondition(range);
    const startTime = `-${amount}${fluxType}`;
    const queryStep = `${step}${fluxType}`;
    const data = (await this.influxDbClient.queryData(measurement, startTime, queryStep)) as MetricOutput[];
    const series = generateSeries(range);
    return mergeByProperty(data, series);
  }
}
