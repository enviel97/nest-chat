import { PopulateOptions } from 'mongoose';

export const normalProjectionUser: string = 'email firstName lastName';
export const requestFriendListPopulate: PopulateOptions = {
  path: 'authorProfile friendProfile',
  select: 'user avatar',
  populate: {
    path: 'user',
    select: normalProjectionUser + '-_id',
  },
};
