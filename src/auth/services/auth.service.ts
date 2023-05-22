import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UserCredentialsDto } from '../dtos/user-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtResponseDto } from '../dtos/jwt-response.dto';
import { UserService } from '../../user/services/user.service';
import { UserCreateDto } from '../../user/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  login(userCredentialsDto: UserCredentialsDto) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          username: userCredentialsDto.username,
        },
      })
      .then(async (user) => {
        if (!bcrypt.compareSync(userCredentialsDto.password, user.password)) {
          throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.id };
        return this.generateTokens(payload);
      })
      .catch((err) => {
        if (err.code === 'P2025') {
          throw new UnauthorizedException('Invalid credentials');
        }
        throw err;
      });
  }

  async register(userCreateDto: UserCreateDto) {
    const user = await this.userService.createUser(userCreateDto);
    const payload = { username: user.username, sub: user.id };
    return this.generateTokens(payload);
  }

  refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      console.log(payload);
      const accessToken = this.jwtService.sign({
        sub: payload.sub,
        username: payload.username,
      });
      return new JwtResponseDto(accessToken, refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '12h',
    });
    return new JwtResponseDto(accessToken, refreshToken);
  }
}
