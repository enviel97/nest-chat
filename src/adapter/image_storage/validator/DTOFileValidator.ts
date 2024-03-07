import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImage', async: false })
class Constraint implements ValidatorConstraintInterface {
  private isImage(file: Express.Multer.File) {
    return file.mimetype.startsWith('image/');
  }

  private isImageSized(file: Express.Multer.File, maxSize: number) {
    return file.size <= maxSize;
  }

  validate(file: Express.Multer.File, args: ValidationArguments) {
    const maxSize = args.constraints[0];
    let isFittedSize = true;
    if (maxSize) {
      isFittedSize = this.isImageSized(file, maxSize);
    }

    return this.isImage(file) && isFittedSize;
  }

  defaultMessage(args: ValidationArguments) {
    const fieldName = args.property;
    const file = args.value;
    if (!file) {
      return `${fieldName} must be provided`;
    }

    const maxSizeInMB = args.constraints[0]
      ? args.constraints[0] / (1024 * 1024)
      : undefined; // Default size is 1 MB

    if (maxSizeInMB) {
      return `${fieldName} size must be less than or equal to ${maxSizeInMB.toExponential(
        2,
      )}MB`;
    }

    return `${fieldName} must be an image`;
  }
}

export function IsImage(
  maxSize?: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isImage',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxSize],
      options: validationOptions,
      validator: Constraint,
    });
  };
}
