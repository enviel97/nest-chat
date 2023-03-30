import { PopulateOptions } from 'mongoose';

export const normalProjectionUser: string = 'email firstName lastName';
export const requestFriendListPopulate: PopulateOptions = {
  path: 'authorProfile',
  select: 'user bio avatar',
  populate: {
    path: 'user',
    select: normalProjectionUser + '-_id',
  },
};
