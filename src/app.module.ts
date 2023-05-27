import { Module } from '@nestjs/common';
import { SurveyModule } from './survey/survey.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    CommonModule,
    SurveyModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
