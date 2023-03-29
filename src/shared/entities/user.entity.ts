import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('users')
export class User extends BaseEntityIncrementId {
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  provider: string;
}
