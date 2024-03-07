import { PassportModule as passport } from '@nestjs/passport';

export const PassportModule = passport.register({
  session: true,
});
