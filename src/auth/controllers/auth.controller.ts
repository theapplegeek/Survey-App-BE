import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserCredentialsDto } from '../dtos/user-credentials.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExceptionResponse } from '../../common/models/exception-response.model';
import { UserCreateDto } from '../../user/dtos/user.dto';
import { PublicAPI } from '../../common/decorators/public.decorator';
import { CustomRequest } from '../../common/models/custom-request.model';
import { JwtResponseDto } from '../dtos/jwt-response.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @PublicAPI()
  @HttpCode(200)
  @ApiProperty({ description: 'User login' })
  @ApiBody({ description: 'Username and password', type: UserCredentialsDto })
  @ApiOkResponse({ description: 'User login success' })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ExceptionResponse<string>,
  })
  async login(@Body() userCredentialsDto: UserCredentialsDto) {
    return this.authService.login(userCredentialsDto);
  }

  @Post('register')
  @ApiProperty({ description: 'User register' })
  @ApiBody({ description: 'User to register', type: UserCreateDto })
  @ApiOkResponse({ description: 'User register success' })
  @ApiBadRequestResponse({
    description: 'Invalid user data',
    type: ExceptionResponse<string[]>,
  })
  async register(@Body() userCreateDto: UserCreateDto) {
    return this.authService.register(userCreateDto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiProperty({ description: 'Refresh token' })
  @ApiOkResponse({ description: 'Refresh token success', type: JwtResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
    type: ExceptionResponse<string>,
  })
  async refreshToken(@Req() req: CustomRequest) {
    return this.authService.refreshToken(req.token);
  }
}
