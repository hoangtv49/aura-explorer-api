import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('delegations')
@Unique(['tx_hash', 'delegator_address', 'validator_address'])
export class Delegation extends BaseEntityIncrementId {
  @Column()
  delegator_address: string;

  @Column({ default: '' })
  validator_address: string;

  @Column({ default: '' })
  shares: string;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  tx_hash: string;

  @Column()
  type: string;
}
