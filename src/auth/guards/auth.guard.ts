import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UserService } from '../../user/services/user.service';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Access token is missing');

    let user: JwtPayloadDto;
    let isBlocked: boolean;

    try {
      user = await this.jwtService.verifyAsync(token);
      isBlocked = await this.userService.userIsBlocked(user.sub);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = user;
      request['token'] = token;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (isBlocked) throw new UnauthorizedException('User is blocked');

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
