import { Column, DeleteDateColumn, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PROVIDER, USER_ROLE } from '../constants/common';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntityIncrementId {
  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  role: USER_ROLE;

  @Column({ nullable: true })
  provider: PROVIDER;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
