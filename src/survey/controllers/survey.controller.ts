import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { SurveyService } from '../services/survey.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../auth/models/role.enum';
import {
  SurveyAnswerDto,
  SurveyCreateDto,
  SurveyDetailDto,
  SurveyDto,
  SurveyListDto,
} from '../dtos/survey.dto';
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe';
import { OrderByPipe } from '../../common/pipes/order-by.pipe';
import { SortByPipe } from '../../common/pipes/sort-by-pipe';
import { ExceptionResponse } from '../../common/models/exception-response.model';

@Controller('survey')
@Roles(Role.User, Role.Admin)
@ApiTags('Survey')
@ApiBearerAuth()
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get()
  @ApiProperty({ description: 'Get all surveys' })
  @ApiQuery({ name: 'page', description: 'Page number', type: Number })
  @ApiQuery({ name: 'size', description: 'Page size', type: Number })
  @ApiQuery({
    name: 'orderBy',
    description: 'Order by field',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort by option',
    type: String,
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiOkResponse({
    description: 'All surveys',
    type: SurveyListDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query params',
    type: ExceptionResponse<string[]>,
  })
  async getAllSurveys(
    @Query('page', ParsePositiveIntPipe) page: number,
    @Query('size', ParsePositiveIntPipe) size: number,
    @Query('orderBy', new OrderByPipe(SurveyDto)) orderBy?: string,
    @Query('sortBy', SortByPipe) sortBy?: string,
  ) {
    return this.surveyService.getAllSurveys(page, size, orderBy, sortBy);
  }

  @Get(':id')
  @ApiProperty({ description: 'Get survey by id' })
  @ApiParam({ name: 'id', description: 'Survey id', type: String })
  @ApiOkResponse({ description: 'Survey', type: SurveyDetailDto })
  @ApiNotFoundResponse({
    description: 'Survey not found',
    type: ExceptionResponse<string>,
  })
  async getSurveyById(@Req() req, @Param('id') id: string) {
    return this.surveyService.getSurveyById(id, req.user.sub);
  }

  @Get('owned')
  @ApiProperty({ description: 'Get all surveys owned by user' })
  @ApiQuery({ name: 'page', description: 'Page number', type: Number })
  @ApiQuery({ name: 'size', description: 'Page size', type: Number })
  @ApiQuery({
    name: 'orderBy',
    description: 'Order by field',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort by option',
    type: String,
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiOkResponse({
    description: 'All surveys owned by current user',
    type: SurveyListDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query params',
    type: ExceptionResponse<string[]>,
  })
  async getAllSurveysOwnedByUser(
    @Req() req,
    @Query('page', ParsePositiveIntPipe) page: number,
    @Query('size', ParsePositiveIntPipe) size: number,
    @Query('orderBy', new OrderByPipe(SurveyDto)) orderBy?: string,
    @Query('sortBy', SortByPipe) sortBy?: string,
  ) {
    return this.surveyService.getAllSurveysOwnedByUser(
      page,
      size,
      orderBy,
      sortBy,
      req.user.sub,
    );
  }

  @Post()
  @ApiProperty({ description: 'Create a survey' })
  @ApiBody({ description: 'Survey to create', type: SurveyCreateDto })
  @ApiOkResponse({ description: 'Survey created', type: SurveyDto })
  async createSurvey(@Req() req, @Body() body: SurveyCreateDto) {
    return this.surveyService.createSurvey({
      ...body,
      Answer: { createMany: { data: body.Answer } },
      createById: req.user.sub,
    });
  }

  @Post('answer')
  @ApiProperty({ description: 'Answer a survey' })
  @ApiBody({ description: 'Survey to answer', type: SurveyAnswerDto })
  @ApiOkResponse({ description: 'Survey answered', type: SurveyDetailDto })
  @ApiNotFoundResponse({
    description: 'Survey or answer not found',
    type: ExceptionResponse<string>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid body',
    type: ExceptionResponse<string[]>,
  })
  async answerSurvey(@Req() req, @Body() body: SurveyAnswerDto) {
    return this.surveyService.answerSurvey(body, req.user.sub);
  }

  @Delete()
  @ApiProperty({ description: 'Delete a owned survey' })
  @ApiQuery({ name: 'id', description: 'Survey id', type: String })
  @ApiOkResponse({ description: 'Survey deleted', type: SurveyDto })
  @ApiNotFoundResponse({
    description: 'Survey not found',
    type: ExceptionResponse<string>,
  })
  async deleteSurvey(@Req() req, @Query('id') id: string) {
    return this.surveyService.deleteSurvey(id, req.user.sub);
  }
}
