import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import BaseDTO from 'src/common/base';

export const isOk = (code: number) => code <= 299 && code >= 200;

type UploadFileOptions = { upload?: 'single' | 'multiple' };
type File = Express.Multer.File;
type Files = File[] | { [key: string]: File | File[] };
const validateDTO = (dto: object) => {
  const errors = validateSync(dto);
  if ((errors?.length ?? 0) === 0) return;
  const formattedErrors = errors.reduceRight((errors, error) => {
    return {
      ...errors,
      [error.property]: error.constraints,
    };
  }, {});
  throw new BadRequestException({
    message: 'Invalid request',
    errors: formattedErrors,
  });
};

const buildBody = <T>(request: any, options?: UploadFileOptions): T => {
  const body = request.body;
  if (!body) throw new BadRequestException('Data not found');

  if (!options || !options.upload) return body;
  switch (options.upload) {
    case 'single': {
      const file = request.file as File;
      if (!file) return body;
      return { ...body, [file.fieldname]: file };
    }
    case 'multiple': {
      const files = request.files as Files;
      if (!files) return body;
      if (Array.isArray(files) && files.length !== 0) {
        const file = files.at(0);
        return { ...body, [file.fieldname]: files };
      }
      return { ...body, ...files };
    }
  }
};

export const BodyDTO = <T extends BaseDTO>(
  data: ClassConstructor<T>,
  options?: UploadFileOptions,
) => {
  const result = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = buildBody<T>(request, options);
    const object = plainToInstance(data, body);
    validateDTO(object);
    return object;
  });
  return result();
};
