import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { PrismaHelper } from './helpers/prisma-helper.service';
import { SortByPipe } from './pipes/sort-by-pipe';
import { ParsePositiveIntPipe } from './pipes/parse-positive-int.pipe';

@Global()
@Module({
  providers: [PrismaService, PrismaHelper, SortByPipe, ParsePositiveIntPipe],
  exports: [PrismaService, PrismaHelper, SortByPipe, ParsePositiveIntPipe],
})
export class CommonModule {}
