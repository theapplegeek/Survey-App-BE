import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserCredentials {
  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
