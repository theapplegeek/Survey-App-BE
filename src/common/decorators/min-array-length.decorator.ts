import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MinArrayLength(
  min: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'minArrayLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min],
      options: validationOptions,
      validator: {
        validate(value: any[]) {
          return value.length >= min;
        },
        defaultMessage(args?: ValidationArguments): string {
          return `${args.property} must be longer than or equal to ${min} elements`;
        },
      },
    });
  };
}
