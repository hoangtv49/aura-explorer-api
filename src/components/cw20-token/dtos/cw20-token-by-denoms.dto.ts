import { ApiProperty } from '@nestjs/swagger';
export class Cw20TokenByDenomsParamsDto {
  @ApiProperty()
  denoms: string[];
}
