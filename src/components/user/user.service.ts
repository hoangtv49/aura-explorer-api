import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, FindOneOptions } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { MESSAGES, USER_ROLE } from 'src/shared';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
  ) {}

  async findOne(params: FindOneOptions<User> = {}): Promise<User> {
    return await this.usersRepository.findOne(params);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async update(user: UpdateUserDto): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.usersRepository.softDelete(id);
  }

  checkRole(user: DeepPartial<User>): void {
    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }

    if (user.role === USER_ROLE.BANNED) {
      throw new UnauthorizedException(MESSAGES.ERROR.BANNED);
    }
  }
}
