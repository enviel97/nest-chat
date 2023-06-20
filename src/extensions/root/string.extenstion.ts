import { isMongoId } from 'class-validator';
import string from 'src/utils/string';

declare global {
  interface String {
    toMongooseObjectId(): boolean;
  }
}

/*eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
Object.defineProperty(String.prototype, 'toMongooseObjectId', {
  value: function () {
    if (isMongoId(this)) throw new Error('Value not mongodb ID');
    return string.cvtToObjectId(this);
  },
});

export {};
