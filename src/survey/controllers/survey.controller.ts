import { Body, Controller, Post } from '@nestjs/common';
import { SurveyService } from '../services/survey.service';
import { Prisma } from '@prisma/client';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  async createSurvey(@Body() body: Prisma.SurveyCreateInput) {
    return this.surveyService.createSurvey(body);
  }
}
