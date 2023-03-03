import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseStringArrayPipe implements PipeTransform<string, string[]> {
  transform(value: string, metadata: ArgumentMetadata): string[] {
    const list = value.split(',');
    return list;
  }
}
