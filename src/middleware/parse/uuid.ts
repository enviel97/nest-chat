import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { version as uuidVersion, validate as uuidValidate } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const [uuid, version] = value.split('__');
    if (!uuidValidate(uuid) || uuidVersion(uuid) !== 5) {
      Logger.error(`uuid: ${uuid}`, 'Prase UUID');
      Logger.error(metadata, 'Prase UUID');
      throw new BadRequestException('Validation failed');
    }
    Logger.log(`Get image ${uuid} version ${version}`, 'Image Id');
    return uuid;
  }
}
