import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('refresh-tokens')
export class RefreshToken extends BaseEntityIncrementId {
  @Column({ nullable: false, type: 'text' })
  refresh_token: string;
}
