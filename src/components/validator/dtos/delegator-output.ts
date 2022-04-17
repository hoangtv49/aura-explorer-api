import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DelegatorOutput {
    @Expose()
    @ApiProperty()
    title: string;

    @Expose()
    @ApiProperty()
    operator_address: string;

    @Expose()
    @ApiProperty()
    acc_address: string;

    @Expose()
    @ApiProperty()
    commission: number;
}