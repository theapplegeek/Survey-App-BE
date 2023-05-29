import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtResponse } from '../models/jwt-response.model';
import { UserCredentials } from '../models/user-credentials.model';
import { UserRegisterDto } from '../../user/dtos/user.dto';
import { createMock } from '@golevelup/ts-jest';
import { CustomRequest } from '../../common/models/custom-request.model';

describe('AuthController', () => {
  let controller: AuthController;

  const jwtResponse = new JwtResponse(
    'Bearer access-token',
    'Bearer refresh-token',
  );
  const userCredentials = new UserCredentials('username', 'password');
  const userRegisterDto: UserRegisterDto = {
    username: 'username',
    password: 'password',
    email: 'email@mail.com',
    roleId: undefined,
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue(jwtResponse),
    register: jest.fn().mockResolvedValue(jwtResponse),
    refreshToken: jest.fn().mockResolvedValue(jwtResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return jwtResponse when login is successful', () => {
      const result = controller.login(userCredentials);

      expect(result).resolves.toEqual(jwtResponse);
    });
  });

  describe('register', () => {
    it('should return jwtResponse when register is successful', () => {
      const result = controller.register(userRegisterDto);

      expect(result).resolves.toEqual(jwtResponse);
    });
  });

  describe('refreshToken', () => {
    it('should return jwtResponse when refresh token is successful', () => {
      const request = createMock<CustomRequest>();
      const result = controller.refreshToken(request);

      expect(result).resolves.toEqual(jwtResponse);
    });
  });
});
