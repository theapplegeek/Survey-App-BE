import { Module } from '@nestjs/common';
import { SurveyModule } from './survey/survey.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CommonModule, SurveyModule, UserModule],
})
export class AppModule {}
