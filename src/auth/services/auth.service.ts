import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UserCredentials } from '../models/user-credentials.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtResponse } from '../models/jwt-response.model';
import { UserService } from '../../user/services/user.service';
import { UserRegisterDto, UserWithPasswordDto } from '../../user/dtos/user.dto';
import { JwtPayload } from '../models/jwt.payload.model';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { Role } from '../models/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  login(userCredentialsDto: UserCredentials) {
    return this.prisma.user
      .findUniqueOrThrow({
        select: this.prismaHelper.generateSelectFields(UserWithPasswordDto),
        where: {
          username: userCredentialsDto.username,
        },
      })
      .then(async (user: UserWithPasswordDto) => {
        if (
          user.blocked ||
          !bcrypt.compareSync(userCredentialsDto.password, user.password)
        ) {
          throw new UnauthorizedException('Invalid credentials');
        }
        const payload = new JwtPayload(user.username, user.id, user.Role.name);
        return await this.generateTokens(payload);
      })
      .catch((err) => {
        if (err.code === 'P2025') {
          throw new UnauthorizedException('Invalid credentials');
        }
        throw err;
      });
  }

  async register(userCreateDto: UserRegisterDto) {
    const userRole = await this.prisma.role.findUnique({
      select: { id: true },
      where: { name: Role.User },
    });
    userCreateDto.roleId = userRole.id;
    const user = await this.userService.createUser(userCreateDto);
    const payload = new JwtPayload(user.username, user.id, user.Role.name);
    return await this.generateTokens(payload);
  }

  async refreshToken(refreshToken: string) {
    try {
      const { username, sub, role } = await this.jwtService.verifyAsync(
        refreshToken,
      );
      const payload = new JwtPayload(username, sub, role);
      const accessToken = await this.jwtService.signAsync({ ...payload });
      return new JwtResponse(accessToken, refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync({ ...payload });
    const refreshToken = await this.jwtService.signAsync(
      { ...payload },
      {
        expiresIn: '12h',
      },
    );
    return new JwtResponse(accessToken, refreshToken);
  }
}
