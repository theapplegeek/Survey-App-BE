import { ApiProperty } from '@nestjs/swagger';

export class CountPayload {
  @ApiProperty({ description: 'Count of user created' })
  count: number;
}
