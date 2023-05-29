import { AuthGuard } from './auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { JwtPayload } from '../models/jwt.payload.model';
import { UserService } from '../../user/services/user.service';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflect: Reflector;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: UserService,
          useValue: {
            userIsBlocked: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    reflect = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when IS_PUBLIC_API is true', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(true);

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).resolves.toBe(true);
    });

    it('should throw UnauthorizedException when token is missing', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(false);
      guard.extractTokenFromHeader = jest.fn().mockReturnValue(undefined);

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).rejects.toThrowError(UnauthorizedException);
      expect(canActivate).rejects.toThrowError('Access token is missing');
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(false);
      guard.extractTokenFromHeader = jest.fn().mockReturnValue('invalid-token');
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('invalid-token'));

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).rejects.toThrowError(UnauthorizedException);
      expect(canActivate).rejects.toThrowError('Invalid access token');
    });

    it('should throw UnauthorizedException when user is blocked', () => {
      const jwtPayload: JwtPayload = new JwtPayload('user', 'user-sub', 'USER');

      reflect.getAllAndOverride = jest.fn().mockReturnValue(false);
      guard.extractTokenFromHeader = jest.fn().mockReturnValue('valid-token');
      jwtService.verifyAsync = jest.fn().mockResolvedValue(jwtPayload);
      userService.userIsBlocked = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('User is blocked'));

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).rejects.toThrowError(UnauthorizedException);
      expect(canActivate).rejects.toThrowError('Invalid access token');
    });

    it('should return true when user is not blocked and token is valid', () => {
      const jwtPayload: JwtPayload = new JwtPayload('user', 'user-sub', 'USER');

      reflect.getAllAndOverride = jest.fn().mockReturnValue(false);
      guard.extractTokenFromHeader = jest.fn().mockReturnValue('valid-token');
      jwtService.verifyAsync = jest.fn().mockResolvedValue(jwtPayload);
      userService.userIsBlocked = jest.fn().mockResolvedValue(false);

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).resolves.toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return undefined when token is missing inside request header', () => {
      const request = createMock<Request>({
        headers: {},
      });

      const extractTokenFromHeader = guard.extractTokenFromHeader(request);

      expect(extractTokenFromHeader).toBeUndefined();
    });

    it('should return undefined when token is malformed', () => {
      const request = createMock<Request>({
        headers: { authorization: 'invalid-token' },
      });

      const extractTokenFromHeader = guard.extractTokenFromHeader(request);

      expect(extractTokenFromHeader).toBeUndefined();
    });

    it('should return token when token is present inside request header', () => {
      const request = createMock<Request>({
        headers: { authorization: 'Bearer token' },
      });

      const extractTokenFromHeader = guard.extractTokenFromHeader(request);

      expect(extractTokenFromHeader).toBe('token');
    });
  });
});
