import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { isMongoId, isNotEmpty } from 'class-validator';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isMongoId(value) || !isNotEmpty(value)) {
      Logger.error(
        `metadata: ${metadata}\nvalue: ${value}`,
        'Prase MongoDB ObjectID',
      );
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
