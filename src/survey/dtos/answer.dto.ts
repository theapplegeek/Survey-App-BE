import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class AnswerDto {
  constructor(id?: number, description?: string) {
    this.id = id;
    this.description = description;
  }

  @IsEmpty()
  @ApiProperty({ description: 'Answer id' })
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Answer description' })
  description: string;
}

export class AnswerWithStatDto extends AnswerDto {
  constructor(id?: number, description?: string, percentage?: number) {
    super(id, description);
    this.percentage = percentage;
  }

  @ApiProperty({ description: 'Answered percentage' })
  percentage?: number;
}
