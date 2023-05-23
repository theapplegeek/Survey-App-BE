import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { RoleDto } from '../dtos/role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}
  findAll() {
    return this.prisma.role.findMany({
      select: this.prismaHelper.generateSelectFields(RoleDto),
    });
  }
}
