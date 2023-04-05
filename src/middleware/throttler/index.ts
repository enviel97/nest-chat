import { ThrottlerModule } from '@nestjs/throttler';

export default ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
});
