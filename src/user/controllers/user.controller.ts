import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserCreateDto, UserDto, UserUpdateDto } from '../dtos/user.dto';
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
import { OrderByPipe } from '../../common/pipes/order-by.pipe';
import { SortByPipe } from '../../common/pipes/sort-by-pipe';
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe';
import { CountPayload } from '../../common/models/count-payload.model';
import { ExceptionResponse } from '../../common/models/exception-response.model';
import { PublicAPI } from '../../common/decorators/public.decorator';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiProperty({ description: 'List of users' })
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
    description: 'Return a list of users',
    type: UserDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query params',
    type: ExceptionResponse<string[]>,
  })
  async getUsers(
    @Query('page', ParsePositiveIntPipe) page: number,
    @Query('size', ParsePositiveIntPipe) size: number,
    @Query('orderBy', new OrderByPipe(UserDto)) orderBy?: string,
    @Query('sortBy', SortByPipe) sortBy?: string,
  ) {
    return this.userService.getUsers(page, size, orderBy, sortBy);
  }

  @Get(':id')
  @ApiProperty({ description: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User id to get', type: Number })
  @ApiOkResponse({
    description: 'Return a user',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query params',
    type: ExceptionResponse<string[]>,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ExceptionResponse<string>,
  })
  async getUserById(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Post()
  @ApiProperty({ description: 'Create a user' })
  @ApiBody({ description: 'User', type: UserCreateDto })
  @ApiOkResponse({
    description: 'Return a user created',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid body',
    type: ExceptionResponse<string[]>,
  })
  async createUser(@Body() body: UserCreateDto) {
    return this.userService.createUser(body);
  }

  @Post('import')
  @ApiProperty({ description: 'Import a list of users' })
  @ApiBody({ description: 'List of users', type: UserCreateDto, isArray: true })
  @ApiOkResponse({
    description: 'Return a count of user created',
    type: CountPayload,
  })
  @ApiBadRequestResponse({
    description: 'Invalid body',
    type: ExceptionResponse<string[]>,
  })
  async importUsers(
    @Body(new ParseArrayPipe({ items: UserCreateDto })) body: UserCreateDto[],
  ) {
    return this.userService.importUsers(body);
  }

  @Put()
  @ApiProperty({ description: 'Update a user' })
  @ApiQuery({ name: 'id', description: 'User id to update', type: Number })
  @ApiBody({ description: 'User', type: UserUpdateDto })
  @ApiOkResponse({
    description: 'Return a user updated',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query params or body',
    type: ExceptionResponse<string[]>,
  })
  async updateUser(
    @Query('id', ParseIntPipe) id: number,
    @Body() body: UserUpdateDto,
  ) {
    return this.userService.updateUser(id, body);
  }

  @Delete()
  @ApiProperty({ description: 'Delete a user' })
  @ApiQuery({ name: 'id', description: 'User id to delete', type: Number })
  @ApiOkResponse({
    description: 'Return user id deleted',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid path variable',
    type: ExceptionResponse<string[]>,
  })
  async deleteUser(@Query('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
