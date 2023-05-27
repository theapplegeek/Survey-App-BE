import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { AnswerWithStatDto } from '../dtos/answer.dto';
import { CacheHelper } from '../../common/helpers/cache.helper';

@Injectable()
export class AnswerService {
  constructor(
    private readonly cacheHelper: CacheHelper,
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  async getAnswerStats(surveyId: string) {
    return this.prisma.answerStats
      .findMany({
        select: this.prismaHelper.generateSelectFields(AnswerWithStatDto),
        where: { surveyId: { equals: surveyId } },
      })
      .then((answerStats) => {
        this.cacheHelper.set(`answer:getAnswerStats:${surveyId}`, answerStats);
        return answerStats;
      });
  }
}
