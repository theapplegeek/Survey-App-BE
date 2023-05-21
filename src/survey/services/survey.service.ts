import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class SurveyService {
  constructor(private prismaService: PrismaService) {}

  createSurvey(body: Prisma.SurveyCreateInput) {
    return this.prismaService.survey.create({ data: body });
  }
}
