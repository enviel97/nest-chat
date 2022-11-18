import { ConfigModule } from '@nestjs/config';

export default ConfigModule.forRoot({
  envFilePath: '.env.development',
  cache: true,
});
