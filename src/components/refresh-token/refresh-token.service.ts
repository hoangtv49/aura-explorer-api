import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/shared/entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dtos/create-refresh-token.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async generateRefreshToken(
    refreshToken: RefreshTokenDto,
  ): Promise<RefreshToken> {
    return await this.refreshTokenRepository.save(refreshToken);
  }
}
