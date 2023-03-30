import environment from 'src/common/environment';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose, { MongooseError } from 'mongoose';
import { Logger } from '@nestjs/common';

export default MongooseModule.forRoot(environment.mongoose.uri, {
  retryWrites: true,
  w: 'majority',
  dbName: environment.mongoose.dbName.dev,
  connectionFactory: (connection: any, name: string) => {
    Logger.log(`[${name}] Connect success`, 'Mongoose');
    mongoose.set('debug', true);
    return connection;
  },
  connectionErrorFactory: (error: MongooseError) => {
    Logger.error(error.message, error.stack, error.name);
    return error;
  },
});
