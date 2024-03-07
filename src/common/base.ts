import { instanceToPlain, plainToInstance } from 'class-transformer';

class BaseDTO implements BaseDTO {
  constructor() {}

  toPlain() {
    return instanceToPlain(this);
  }

  static toDTO(plain: any) {
    return plainToInstance(this, plain);
  }
}

export default BaseDTO;
