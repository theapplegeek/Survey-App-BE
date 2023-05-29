import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { PrismaHelper } from './helpers/prisma.helper';
import { SortByPipe } from './pipes/sort-by-pipe';
import { ParsePositiveIntPipe } from './pipes/parse-positive-int.pipe';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheHelper } from './helpers/cache.helper';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    CacheModule.register({ ttl: 0 }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  providers: [
    CacheHelper,
    PrismaService,
    PrismaHelper,
    SortByPipe,
    ParsePositiveIntPipe,
  ],
  exports: [
    CacheHelper,
    JwtModule,
    PrismaService,
    PrismaHelper,
    SortByPipe,
    ParsePositiveIntPipe,
  ],
})
export class CommonModule {}
