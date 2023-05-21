import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class SortByPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) return undefined;

    const sortOrder = ['asc', 'desc'];
    value = value.toLowerCase();

    if (!sortOrder.includes(value)) {
      throw new BadRequestException(
        `${metadata.data} must be one of the following values: ${sortOrder.join(
          ', ',
        )}`,
      );
    }

    return value;
  }
}
