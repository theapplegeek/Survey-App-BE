import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponse<T> {
  @ApiProperty({ description: 'HTTP Status code' })
  statusCode: number;

  @ApiProperty({ description: 'Error message/s' })
  message: T;

  @ApiProperty({ description: 'Error type' })
  error: string | null;
}
