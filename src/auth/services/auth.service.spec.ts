import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { UserService } from '../../user/services/user.service';
import { createMock } from '@golevelup/ts-jest';
import {
  UserDto,
  UserRegisterDto,
  UserWithPasswordDto,
} from '../../user/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtResponse } from '../models/jwt-response.model';
import { UnauthorizedException } from '@nestjs/common';
import { UserCredentials } from '../models/user-credentials.model';
import { JwtPayload } from '../models/jwt.payload.model';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let userService: UserService;
  let jwtService: JwtService;

  const user = new UserWithPasswordDto(
    'UUID',
    'user@mail.com',
    'Password1!',
    'username',
    { id: 1, name: 'USER' },
  );
  const userCredentials: UserCredentials = new UserCredentials(
    user.username,
    user.password,
  );
  const jwtResponse = new JwtResponse(
    'Bearer access-token',
    'Bearer refresh-token',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>(),
        },
        {
          provide: PrismaHelper,
          useValue: { generateSelectFields: jest.fn() },
        },
        {
          provide: UserService,
          useValue: { createUser: jest.fn() },
        },
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return jwtResponse when login successful', () => {
      prisma.user.findUniqueOrThrow = jest.fn().mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compareSync')
        .mockImplementation(
          (dbPas: string, userPass: string) => dbPas === userPass,
        );
      service.generateTokens = jest.fn().mockReturnValue(jwtResponse);

      expect(service.login(userCredentials)).resolves.toEqual(jwtResponse);
    });

    it('should throw UnauthorizedException when user not found', () => {
      prisma.user.findUniqueOrThrow = jest
        .fn()
        .mockRejectedValue({ code: 'P2025' });

      const login = service.login(userCredentials);

      expect(login).rejects.toThrowError(UnauthorizedException);
      expect(login).rejects.toThrowError('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is incorrect', () => {
      prisma.user.findUniqueOrThrow = jest.fn().mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compareSync')
        .mockImplementation(
          (dbPas: string, userPass: string) => dbPas === userPass,
        );
      const userWithWrongPassword: UserCredentials = {
        ...user,
        password: 'WrongPassword1!',
      };
      const login = service.login(userWithWrongPassword);

      expect(login).rejects.toThrowError(UnauthorizedException);
      expect(login).rejects.toThrowError('Invalid credentials');
    });

    it('should throw UnauthorizedException when user is blocked', () => {
      const blockedUser: UserWithPasswordDto = { ...user, blocked: true };
      prisma.user.findUniqueOrThrow = jest.fn().mockResolvedValue(blockedUser);
      const login = service.login(userCredentials);

      expect(login).rejects.toThrowError(UnauthorizedException);
      expect(login).rejects.toThrowError('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should return jwtResponse when register successful', () => {
      const userDto: UserDto = new UserDto(
        user.id,
        user.email,
        user.username,
        user.Role,
      );
      const userRegisterDto: UserRegisterDto = {
        ...user,
        password: user.password,
        roleId: undefined,
      };

      prisma.role.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      userService.createUser = jest.fn().mockResolvedValue(userDto);
      service.generateTokens = jest.fn().mockReturnValue(jwtResponse);

      expect(service.register(userRegisterDto)).resolves.toEqual(jwtResponse);
    });

    it('should throw error when user already exists', () => {
      const userRegisterDto: UserRegisterDto = {
        ...user,
        password: user.password,
        roleId: undefined,
      };

      prisma.role.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      userService.createUser = jest.fn().mockRejectedValue({ code: 'P2002' });

      const register = service.register(userRegisterDto);

      expect(register).rejects.toEqual({ code: 'P2002' });
    });
  });

  describe('refresh token', () => {
    it('should return jwtResponse when refresh token successful', () => {
      const payload: JwtPayload = new JwtPayload(
        user.username,
        user.id,
        user.Role.name,
      );
      const accessToken = 'Bearer access-token';
      const refreshToken = 'Bearer refresh-token';

      jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);

      expect(service.refreshToken(refreshToken)).resolves.toEqual(
        new JwtResponse(accessToken, refreshToken),
      );
    });

    it('should throw error when refresh token is invalid', () => {
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('Invalid refresh token'));

      const refreshToken = service.refreshToken('invalid refresh-token');

      expect(refreshToken).rejects.toThrowError(UnauthorizedException);
      expect(refreshToken).rejects.toThrowError('Invalid refresh token');
    });
  });

  describe('generateTokens', () => {
    it('should return jwtResponse', () => {
      const payload: JwtPayload = new JwtPayload(
        user.username,
        user.id,
        user.Role.name,
      );
      const accessToken = `Bearer ${payload.username}-${payload.sub}-${payload.role}-`;
      const refreshToken = `Bearer ${payload.username}-${payload.sub}-${payload.role}-12h`;

      jwtService.signAsync = jest
        .fn()
        .mockImplementation((payload: JwtPayload, options?: JwtSignOptions) => {
          return `Bearer ${payload.username}-${payload.sub}-${payload.role}-${
            options?.expiresIn ?? ''
          }`;
        });

      expect(service.generateTokens(payload)).resolves.toEqual(
        new JwtResponse(accessToken, refreshToken),
      );
    });
  });
});
