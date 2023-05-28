import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CommonModule } from '../../common/common.module';
import { UserModule } from '../../user/user.module';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, UserModule],
      providers: [AuthService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
