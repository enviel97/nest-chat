import { PassportModule } from '@nestjs/passport';

export default PassportModule.register({
  session: true,
});
