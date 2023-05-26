import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import {
  SurveyAnswerDto,
  SurveyDetailDto,
  SurveyDto,
} from '../dtos/survey.dto';
import { PrismaHelper } from '../../common/helpers/prisma.helper';
import { AnswerStats, Prisma } from '@prisma/client';
import { AnswerDto } from '../dtos/answer.dto';
import { UserDto } from '../../user/dtos/user.dto';
import { AnswerService } from './answer.service';

@Injectable()
export class SurveyService {
  private surveySelector = {
    ...this.prismaHelper.generateSelectFields(SurveyDto),
    createBy: { select: this.prismaHelper.generateSelectFields(UserDto) },
    Answer: { select: this.prismaHelper.generateSelectFields(AnswerDto) },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelper,
    private readonly answerService: AnswerService,
  ) {}

  async getAllSurveys(
    page: number,
    size: number,
    orderBy?: string,
    sortBy?: string,
  ) {
    return this.prisma.survey
      .findMany({
        select: {
          ...this.surveySelector,
          createBy: { select: { username: true } },
          Answer: false,
        },
        skip: page * size - size,
        take: size,
        orderBy: { [orderBy ?? 'createdAt']: sortBy ?? 'desc' },
      })
      .then((surveys: any) =>
        surveys.map((survey) => {
          survey.createBy = survey.createBy.username;
          return survey;
        }),
      );
  }

  getAllSurveysOwnedByUser(
    page: number,
    size: number,
    orderBy: string,
    sortBy: string,
    sub: string,
  ) {
    return this.prisma.survey
      .findMany({
        select: {
          ...this.surveySelector,
          createBy: { select: { username: true } },
          Answer: false,
        },
        where: {
          createBy: {
            id: sub,
          },
        },
        skip: page * size - size,
        take: size,
        orderBy: { [orderBy ?? 'createdAt']: sortBy ?? 'desc' },
      })
      .then((surveys: any) =>
        surveys.map((survey) => {
          survey.createBy = survey.createBy.username;
          return survey;
        }),
      );
  }

  async getSurveyById(id: string, sub: string) {
    const survey: any = await this.prisma.survey.findUniqueOrThrow({
      select: this.surveySelector,
      where: { id: id },
    });
    const surveyDetail: SurveyDetailDto = {
      ...survey,
      createBy: survey.createBy.username,
    };
    const questionAnswered = await this.prisma.surveyUser
      .findUnique({
        where: {
          userId_surveyId: {
            userId: sub,
            surveyId: id,
          },
        },
      })
      .catch(() => null);
    if (questionAnswered || survey.createBy.id === sub) {
      surveyDetail.questionAnswered = questionAnswered?.answerId ?? null;
      const answerStats: any[] = await this.answerService.getAnswerStats(id);
      const answerStatsMap = new Map<number, AnswerStats>();
      answerStats.forEach((as) => answerStatsMap.set(as.id, as));
      surveyDetail.Answer = surveyDetail.Answer.map((answer: AnswerStats) => {
        answer.percentage = answerStatsMap.get(answer.id)?.percentage ?? 0;
        return answer;
      });
    }
    return surveyDetail;
  }

  createSurvey(body: Prisma.SurveyUncheckedCreateInput) {
    return this.prisma.survey.create({
      select: this.surveySelector,
      data: body,
    });
  }

  async answerSurvey(body: SurveyAnswerDto, sub: string) {
    const { survey }: any = await this.prisma.surveyUser.create({
      select: { survey: { select: this.surveySelector } },
      data: {
        ...body,
        userId: sub,
      },
    });
    return this.getSurveyById(survey.id, sub);
  }

  async deleteSurvey(id: string, sub: string) {
    const { createBy } = await this.prisma.survey.findUnique({
      select: { createBy: { select: { id: true } } },
      where: { id: id },
    });
    if (createBy.id !== sub)
      throw new ForbiddenException('You are not allowed to delete this survey');
    return this.prisma.survey
      .delete({
        select: {
          ...this.surveySelector,
          createBy: { select: { username: true } },
          Answer: false,
        },
        where: { id: id },
      })
      .then((survey: any) => {
        survey.createBy = survey.createBy.username;
        return survey;
      });
  }
}
