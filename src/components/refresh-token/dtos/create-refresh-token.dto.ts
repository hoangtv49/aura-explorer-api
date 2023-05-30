import { randomBytes } from 'crypto';

export class RefreshTokenDto {
  id = 0;
  token = randomBytes(40).toString('hex');
}
