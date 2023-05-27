import { UserDto } from '../../user/dtos/user.dto';
import { AnswerDto, AnswerWithStatDto } from './answer.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { MinArrayLength } from '../../common/decorators/min-array-length.decorator';

export class SurveyDto {
  constructor(
    id?: string,
    title?: string,
    createdAt?: Date,
    createBy?: UserDto,
    Answer?: AnswerDto[],
  ) {
    this.id = id;
    this.title = title;
    this.createdAt = createdAt;
    this.createBy = createBy;
    this.Answer = Answer;
  }

  @ApiProperty({ description: 'Survey id' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Survey title' })
  title: string;

  @ApiProperty({ description: 'Survey creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Survey created by', type: UserDto })
  createBy: UserDto;

  @IsArray()
  @IsNotEmpty()
  @MinArrayLength(2)
  @ApiProperty({
    description: 'Survey answers',
    type: AnswerDto,
    isArray: true,
  })
  Answer: AnswerDto[];
}

export class SurveyCreateDto extends OmitType(SurveyDto, [
  'id',
  'createBy',
  'createdAt',
]) {}

export class SurveyListDto extends OmitType(SurveyDto, ['createBy']) {
  @ApiProperty({
    description: 'Survey created by username',
    type: String,
  })
  createBy: string;
}

export class SurveyDetailDto extends SurveyListDto {
  @ApiProperty({ description: 'Number of answered question', type: Number })
  questionAnswered?: number;

  @ApiProperty({
    description: 'Survey answers',
    type: AnswerWithStatDto,
    isArray: true,
  })
  Answer: AnswerWithStatDto[];
}

export class SurveyAnswerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Survey id' })
  surveyId: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ description: 'Answer id' })
  answerId: number;
}
