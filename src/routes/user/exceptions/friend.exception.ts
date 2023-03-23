import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestException extends HttpException {
  constructor(private readonly relationship: Friend<User>) {
    let message = 'Friend request error';
    switch (relationship.status) {
      case 'Accept':
        message = 'You two already friends';
        break;
      case 'Request':
        message = 'You should be check your list friend request';
    }
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class FriendNotFoundException extends HttpException {
  constructor() {
    let message = 'Friend request not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
