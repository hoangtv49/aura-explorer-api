import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NAME_TAG_TYPE } from '../../../shared';
import { IsUrl } from 'class-validator';

export class StoreNameTagParamsDto {
  @ApiProperty({ default: '' })
  id: number;

  @ApiProperty({ default: '' })
  type: NAME_TAG_TYPE;

  @ApiProperty({ default: '' })
  address: string;

  @ApiProperty({ default: '' })
  nameTag: string;

  @ApiProperty({ default: '' })
  userId: number;

  @ApiPropertyOptional({
    default: '',
  })
  @IsUrl(undefined, { message: 'Enterprise url must be a valid url.' })
  enterpriseUrl: string;
}
