import { ThrottlerModule } from '@nestjs/throttler';

export default ThrottlerModule.forRoot({
  ttl: 30,
  limit: 10,
});
