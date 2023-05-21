import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!this.isPositive(value)) {
      throw new BadRequestException(
        `${metadata.data} must be a positive integer number`,
      );
    }

    return Number(value);
  }

  private isPositive(value: string): boolean {
    const number = Number(value);
    const isNumber = !isNaN(number);
    return isNumber && this.isInteger(value) && number > 0;
  }

  private isInteger(value: string): boolean {
    return !value.includes('.') && !value.includes(',');
  }
}
