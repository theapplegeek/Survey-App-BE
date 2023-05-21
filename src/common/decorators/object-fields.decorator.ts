import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ObjectFields<T>(
  clazz: { new (): T },
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'objectFields',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [clazz],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const targetClass = new clazz();
          const fields = Object.keys(targetClass);
          return fields.includes(value);
        },
        defaultMessage(args?: ValidationArguments): string {
          return `${
            args.property
          } must be one of the following values: ${Object.keys(
            new clazz(),
          ).join(', ')}`;
        },
      },
    });
  };
}
