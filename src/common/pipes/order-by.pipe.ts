import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class OrderByPipe<T> implements PipeTransform<string, string> {
  private readonly targetObject: T;
  constructor(clazz: { new (): T }) {
    this.targetObject = new clazz();
  }

  transform(value: string, metadata: ArgumentMetadata) {
    if (!value) return undefined;

    const keys = Object.keys(this.targetObject);

    if (!keys.includes(value)) {
      throw new BadRequestException(
        `${metadata.data} must be one of the following values: ${keys.join(
          ', ',
        )}`,
      );
    }

    return value;
  }
}
