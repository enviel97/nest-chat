import { BadRequestException } from '@nestjs/common';

interface ProtectPasswordProps {
  isHidden: boolean;
}

export const ProtectPassword = ({ isHidden }: ProtectPasswordProps) => {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const value = await originalMethod.call(this, ...args);
      if (!value) throw new BadRequestException();
      if (isHidden && value.password) {
        delete value['password'];
      }
      return value;
    };
  };
};
