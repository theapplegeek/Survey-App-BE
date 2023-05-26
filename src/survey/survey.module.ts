import { Module } from '@nestjs/common';
import { SurveyController } from './controllers/survey.controller';
import { SurveyService } from './services/survey.service';
import { AnswerService } from './services/answer.service';

@Module({
  controllers: [SurveyController],
  providers: [SurveyService, AnswerService],
})
export class SurveyModule {}
