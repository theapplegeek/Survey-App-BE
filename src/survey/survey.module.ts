import { Module } from '@nestjs/common';
import { SurveyController } from './controllers/survey.controller';
import { SurveyService } from './services/survey.service';

@Module({
  imports: [],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
