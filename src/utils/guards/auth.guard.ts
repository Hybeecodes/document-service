import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../meta/skip-auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger;
  private readonly API_TOKEN: string;
  constructor(
    private readonly config: ConfigService,
    private reflector: Reflector,
  ) {
    this.logger = new Logger(this.constructor.name);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    request.user = await this.validateRequest(request);
    return true;
  }
  async validateRequest(request: {
    headers: { authorization: string };
  }): Promise<void> {
    const { authorization } = request.headers;
    if (!authorization) {
      this.logger.error('No Authorization Token');
      throw new HttpException(
        'No Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const authArr = authorization.split(' ');
    if (authArr[0] !== 'Bearer') {
      this.logger.error('No Authorization Token');
      throw new HttpException(
        'Invalid Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const authToken = authArr[1];
    if (authToken !== this.API_TOKEN) {
      this.logger.error('No Authorization Token');
      throw new HttpException(
        'Invalid Authorization Token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
