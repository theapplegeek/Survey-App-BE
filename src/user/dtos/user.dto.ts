import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class UserDto {
  constructor(id?: number, username?: string, email?: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.createdAt = new Date();
    this.blocked = false;
  }

  @ApiProperty({ description: 'The id of the user' })
  id: number;

  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'When the user is created' })
  createdAt: Date;

  @ApiProperty({ description: 'User is blocked' })
  blocked: boolean;
}

export class UserCreateDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'blocked',
] as const) {
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1,
    },
    {
      each: true,
      message:
        'Password must be at least 8 characters long, and contain at least one number, one symbol, one uppercase and one lowercase letter',
    },
  )
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}

export class UserUpdateDto extends OmitType(UserDto, [
  'id',
  'createdAt',
] as const) {}
