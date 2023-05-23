import { ApiProperty } from '@nestjs/swagger';

export class JwtResponse {
  constructor(access_token: string, refresh_token: string) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  @ApiProperty({ description: 'JWT Access token' })
  access_token: string;

  @ApiProperty({ description: 'JWT Refresh token' })
  refresh_token: string;
}
