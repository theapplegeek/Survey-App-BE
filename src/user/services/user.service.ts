import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UserCreateDto, UserDto, UserUpdateDto } from '../dtos/user.dto';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { CacheHelper } from '../../common/helpers/cache.helper';

@Injectable()
export class UserService {
  constructor(
    private cacheHelper: CacheHelper,
    private prismaService: PrismaService,
    private prismaHelper: PrismaHelper,
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

  async getUserById(id: number) {
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

  async createUser(body: UserCreateDto) {
    return this.prismaService.user
      .create({
        select: this.prismaHelper.generateSelectFields(UserDto),
        data: body,
      })
      .then((user) => {
        this.cacheHelper.del([/^users:getUsers:.+$/]);
        return user;
      });
  }

  importUsers(body: UserCreateDto[]) {
    return this.prismaService.user
      .createMany({
        data: body,
      })
      .then((users) => {
        this.cacheHelper.del([/^users:getUsers:.+$/]);
        return users;
      });
  }

  updateUser(id: number, body: UserUpdateDto) {
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

  deleteUser(id: number) {
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
}
