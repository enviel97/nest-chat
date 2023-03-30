import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CorsOption: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://192.168.27.8:3000',
    'https://192.168.27.8:3000',
    'http://localhost:4173',
  ],
  credentials: true,
};
