import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CorsOption: CorsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true,
};
