import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UserCreateDto, UserDto, UserUpdateDto } from '../dtos/user.dto';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { CacheHelper } from '../../common/helpers/cache.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly cacheHelper: CacheHelper,
    private readonly prismaService: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  async getUsers(
    page: number,
    size: number,
    orderBy?: string,
    sortBy?: string,
  ) {
    const cacheKey = `users:getUsers:${page}-${size}-${orderBy}-${sortBy}`;
    const users = await this.cacheHelper.get<UserDto[]>(cacheKey);
    if (users) return users;

    return this.prismaService.user
      .findMany({
        select: this.prismaHelper.generateSelectFields(UserDto),
        take: size,
        skip: page * size - size,
        orderBy: {
          [orderBy ?? 'username']: sortBy ?? 'asc',
        },
      })
      .then((users) => {
        this.cacheHelper.set(cacheKey, users);
        return users;
      });
  }

  async getUserById(id: string) {
    const cacheKey = `users:getUserById:${id}`;
    const user = await this.cacheHelper.get<UserDto>(cacheKey);
    if (user) return user;

    return this.prismaService.user
      .findUniqueOrThrow({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
      })
      .then((user) => {
        this.cacheHelper.set(cacheKey, user);
        return user;
      })
      .catch((err) => {
        if (err.code === 'P2025') throw new NotFoundException(err.message);
        throw err;
      });
  }

  createUser(body: UserCreateDto) {
    body.password = this.hashPassword(body.password);
    return this.prismaService.user
      .create({
        select: this.prismaHelper.generateSelectFields(UserDto),
        data: body,
      })
      .then((user: UserDto) => {
        this.cacheHelper.del([/^users:getUsers:.+$/]);
        return user;
      });
  }

  importUsers(body: UserCreateDto[]) {
    body.forEach((user) => {
      user.password = this.hashPassword(user.password);
    });
    return this.prismaService.user
      .createMany({
        data: body,
      })
      .then((users) => {
        this.cacheHelper.del([/^users:getUsers:.+$/]);
        return users;
      });
  }

  updateUser(id: string, body: UserUpdateDto) {
    return this.prismaService.user
      .update({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
        data: body,
      })
      .then((user) => {
        this.cacheHelper.del([
          /^users:getUsers:.+$/,
          new RegExp(`^user:getUserById:${id}$`),
        ]);
        return user;
      });
  }

  blockUser(id: string) {
    return this.prismaService.user
      .update({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
        data: { blocked: true },
      })
      .then((user) => {
        this.cacheHelper.del([
          /^users:getUsers:.+$/,
          new RegExp(`^user:getUserById:${id}$`),
        ]);
        return user;
      });
  }

  unlockUser(id: string) {
    return this.prismaService.user
      .update({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
        data: { blocked: false },
      })
      .then((user) => {
        this.cacheHelper.del([
          /^users:getUsers:.+$/,
          new RegExp(`^user:getUserById:${id}$`),
        ]);
        return user;
      });
  }

  deleteUser(id: string) {
    return this.prismaService.user
      .delete({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
      })
      .then((user) => {
        this.cacheHelper.del([
          /^users:getUsers:.+$/,
          new RegExp(`^user:getUserById:${id}$`),
        ]);
        return user;
      });
  }

  userIsBlocked(id: string) {
    return this.prismaService.user
      .findUniqueOrThrow({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
      })
      .then((user: UserDto) => {
        return user.blocked;
      });
  }

  private hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(13);
    return bcrypt.hashSync(password, salt);
  }
}
