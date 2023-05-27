import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { RoleDto } from '../dtos/role.dto';
import { CacheHelper } from '../../common/helpers/cache.helper';

@Injectable()
export class RoleService {
  constructor(
    private readonly cacheHelper: CacheHelper,
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}
  async findAll() {
    return this.prisma.role
      .findMany({
        select: this.prismaHelper.generateSelectFields(RoleDto),
      })
      .then((roles) => {
        this.cacheHelper.setWithTTL('roles', roles, 1000 * 60 * 60 * 24);
        return roles;
      });
  }
}
