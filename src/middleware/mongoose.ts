import environment from 'src/common/environment';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseError } from 'mongoose';
import { Logger } from '@nestjs/common';

export default MongooseModule.forRoot(environment.mongoose.uri, {
  retryWrites: true,
  w: 'majority',
  dbName: environment.mongoose.dbName.dev,
  connectionFactory: (_, name: string) => {
    Logger.log(`[${name}] Connect success`, 'Mongoose');
  },
  connectionErrorFactory: (error: MongooseError) => {
    Logger.error(error.message, error.stack, error.name);
    return error;
  },
});
