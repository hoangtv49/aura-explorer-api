import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AkcLogger, BaseApiResponse, ReqContext, RequestContext, SwaggerBaseApiResponse } from 'src/shared';
import { MetricOutput } from '../dtos/metric-output.dto';
import { MetricParamsDto } from '../dtos/metric-params.dto';

import { MetricService } from '../services/metric.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricController {
  constructor(
    private readonly metricService: MetricService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(MetricController.name);
  }

  @Get('blocks')
  @ApiOperation({ summary: 'Get block metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlockMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getBlockMetric.name} was called!`);

    const metrics = await this.metricService.getBlock(ctx, query.range);

    return { data: metrics, meta: null };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getTransactionMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getTransactionMetric.name} was called!`);

    const metrics = await this.metricService.getTransaction(ctx, query.range);

    return { data: metrics, meta: null };
  }

  @Get('validators')
  @ApiOperation({ summary: 'Get validator metric API' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(MetricOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getValidatorMetric(
    @ReqContext() ctx: RequestContext,
    @Query() query: MetricParamsDto,
  ): Promise<BaseApiResponse<MetricOutput[]>> {
    this.logger.log(ctx, `${this.getValidatorMetric.name} was called!`);

    const metrics = await this.metricService.getValidator(ctx, query.range);

    return { data: metrics, meta: null };
  }
}