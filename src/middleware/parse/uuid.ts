import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const [uuid, _] = value.split('+');
    if (!uuidValidate(uuid) || uuidVersion(uuid) !== 5) {
      Logger.error(`uuid: ${uuid}`, 'Prase UUID');
      Logger.error(metadata, 'Prase UUID');
      throw new BadRequestException('Validation failed');
    }
    return uuid;
  }
}
