import { Prisma } from '@prisma/client';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { status, message } = this.getStatusAndMessage(exception);

    response.status(status).json({
      statusCode: status,
      message: message,
      error: this.transformExceptionString(HttpErrorByCode[status].name),
    });
  }

  private getStatusAndMessage(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${(exception.meta.target as string[]).join(
            ' and ',
          )} already exist${
            (exception.meta.target as string[]).length > 1 ? 's' : ''
          }`,
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: `${exception.meta?.cause ?? exception.message}`,
        };
      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        };
      }
    }
  }

  private transformExceptionString(inputString: string) {
    const exceptionPostfix = 'Exception';
    const words = inputString.split(/(?=[A-Z])/);
    const transformedWords = words.filter(
      (word) => !word.endsWith(exceptionPostfix),
    );
    return transformedWords.join(' ');
  }
}
