import { Module } from '@nestjs/common';
import { SurveyModule } from './survey/survey.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CommonModule, SurveyModule, UserModule, AuthModule],
})
export class AppModule {}
