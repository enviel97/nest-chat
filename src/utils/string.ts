import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

const cvtToObjectId = (plainText: string) => {
  try {
    return new Types.ObjectId(plainText);
  } catch (error) {
    return;
  }
};

const getId = (object?: any) => {
  if (typeof object === 'string') return object;
  if (!object?.id && !object?._id)
    throw new BadRequestException('Invalid request');
  return (object?.id ?? object?._id).toString();
};

const getFullName = (user: User) => `${user.lastName} ${user.firstName}`;

const generatorId = () => {
  return new Types.ObjectId().toString();
};

/**
 *
 * @param size {number} size of file
 * @param decimals {number | undefine} number behind dot
 * @returns {string} normal size format like MB, GB, Bytes, ...
 */
const K_UNIT = 1024;
const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
const cvtToNormalSize = (size: number, decimals?: number) => {
  if (size === 0) return '0 Byte';
  const i = Math.floor(Math.log(size) / Math.log(K_UNIT));
  const resp = `${parseFloat(
    (size / Math.pow(K_UNIT, i)).toFixed(decimals ?? 2),
  )} ${SIZES[i]}`;
  return resp;
};
export default {
  cvtToObjectId,
  getId,
  getFullName,
  generatorId,
  cvtToNormalSize,
};
