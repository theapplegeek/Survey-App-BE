import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from '../../src/user/dtos/user.dto';
import { setupAppConfiguration } from '../../src/app.config';
import { UserCredentials } from '../../src/auth/models/user-credentials.model';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const userRegister: UserRegisterDto = {
    email: 'user@mail.com',
    username: 'user',
    password: 'Password1!',
  };
  const userCredentials = new UserCredentials(
    userRegister.username,
    userRegister.password,
  );
  let refreshToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    setupAppConfiguration(app);

    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register successful', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userRegister)
        .expect(200)
        .expect(jwtResponseCheck);
    });

    it('should throw badRequestException when register with existing email', () => {
      const userRegisterWithSameUsername: UserRegisterDto = { ...userRegister };
      userRegisterWithSameUsername.username = 'user1';

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userRegister)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toBe('email already exist');
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('should throw badRequestException when register with existing username', () => {
      const userRegisterWithSameUsername: UserRegisterDto = { ...userRegister };
      userRegisterWithSameUsername.email = 'mail@mail.com';

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userRegisterWithSameUsername)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toBe('username already exist');
          expect(res.body.error).toBe('Bad Request');
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successful', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials)
        .expect(200)
        .expect(jwtResponseCheck)
        .expect((res) => {
          refreshToken = res.body.refresh_token;
        });
    });

    it('should throw unauthorizedException when login with wrong password', () => {
      const userCredentialsWithWrongPassword: UserCredentials = {
        ...userCredentials,
      };
      userCredentialsWithWrongPassword.password = 'wrongPassword';

      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentialsWithWrongPassword)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
          expect(res.body.statusCode).toBe(401);
          expect(res.body.message).toBe('Invalid credentials');
          expect(res.body.error).toBe('Unauthorized');
        });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successful', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .expect(200)
        .expect(jwtResponseCheck);
    });
  });

  const jwtResponseCheck = (res: request.Response) => {
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
    expect(jwtService.verifyAsync(res.body.access_token)).resolves.toBeTruthy();
    expect(
      jwtService.verifyAsync(res.body.refresh_token),
    ).resolves.toBeTruthy();
  };
});
