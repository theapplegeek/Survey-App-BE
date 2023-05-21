import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { UserCreateDto, UserDto, UserUpdateDto } from '../dtos/user.dto';
import { PrismaHelper } from '../../common/helpers/prisma-helper.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private prismaHelper: PrismaHelper,
  ) {}

  getUsers(page: number, size: number, orderBy?: string, sortBy?: string) {
    return this.prismaService.user.findMany({
      select: this.prismaHelper.generateSelectFields(UserDto),
      take: size,
      skip: page * size - size,
      orderBy: {
        [orderBy ?? 'username']: sortBy ?? 'asc',
      },
    });
  }

  getUserById(id: number) {
    return this.prismaService.user
      .findUniqueOrThrow({
        select: this.prismaHelper.generateSelectFields(UserDto),
        where: { id: id },
      })
      .catch((err) => {
        if (err.code === 'P2025') throw new NotFoundException(err.message);
        throw err;
      });
  }

  createUser(body: UserCreateDto) {
    return this.prismaService.user.create({
      select: this.prismaHelper.generateSelectFields(UserDto),
      data: body,
    });
  }

  importUsers(body: UserCreateDto[]) {
    return this.prismaService.user.createMany({
      data: body,
    });
  }

  updateUser(id: number, body: UserUpdateDto) {
    return this.prismaService.user.update({
      select: this.prismaHelper.generateSelectFields(UserDto),
      where: { id: id },
      data: body,
    });
  }

  deleteUser(id: number) {
    return this.prismaService.user.delete({
      select: this.prismaHelper.generateSelectFields(UserDto),
      where: { id: id },
    });
  }
}
