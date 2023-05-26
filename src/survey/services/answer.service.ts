import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { AnswerWithStatDto } from '../dtos/answer.dto';

@Injectable()
export class AnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
  ) {}

  getAnswerStats(surveyId: string) {
    return this.prisma.answerStats.findMany({
      select: this.prismaHelper.generateSelectFields(AnswerWithStatDto),
      where: { surveyId: { equals: surveyId } },
    });
  }
}
