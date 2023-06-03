import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { RoleDto } from './role.dto';

export class UserDto {
  constructor(id?: string, username?: string, email?: string, role?: RoleDto) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.createdAt = new Date();
    this.blocked = false;
    this.Role = role;
  }

  @ApiProperty({ description: 'The UUID of the user' })
  id: string;

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

  @ApiProperty({ description: 'The role of the user', type: RoleDto })
  Role: RoleDto;
}

export class UserCreateDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'blocked',
  'Role',
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

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ description: 'The role id of the user' })
  roleId: number;
}

export class UserRegisterDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'blocked',
  'Role',
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

  @IsEmpty()
  @ApiProperty({ description: 'The role id of the user' })
  roleId?: number;
}

export class UserUpdateDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'Role',
] as const) {
  @IsOptional()
  @ApiProperty({ description: 'The role id of the user' })
  roleId: number;
}

export class UserWithPasswordDto extends UserDto {
  constructor(
    id?: string,
    email?: string,
    username?: string,
    password?: string,
    role?: RoleDto,
  ) {
    super(id, username, email, role);
    this.password = password;
  }

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
