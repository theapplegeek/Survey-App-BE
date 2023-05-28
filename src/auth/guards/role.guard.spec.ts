import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflect: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGuard],
    }).compile();

    reflect = module.get<Reflector>(Reflector);
    guard = module.get<RoleGuard>(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when REQUIRE_ROLES is false', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(false);

      const context = createMock<ExecutionContext>();
      const canActivate = guard.canActivate(context);

      expect(canActivate).toBe(true);
    });

    it('should return false when user role is NOT permitted', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);

      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'USER' },
          }),
        }),
      });
      const canActivate = guard.canActivate(context);

      expect(canActivate).toBe(false);
    });

    it('should return true when user role is permitted', () => {
      reflect.getAllAndOverride = jest.fn().mockReturnValue(['USER', 'ADMIN']);

      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'USER' },
          }),
        }),
      });
      const canActivate = guard.canActivate(context);

      expect(canActivate).toBe(true);
    });
  });
});
