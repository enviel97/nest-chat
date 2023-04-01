import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestAcceptedException extends HttpException {
  constructor() {
    super('You two already friends', HttpStatus.BAD_REQUEST);
  }
}
export class FriendRequestPendingException extends HttpException {
  constructor() {
    super(
      'You should be check your list friend request',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FriendRequestRejectException extends HttpException {
  constructor() {
    super('You should be resend friend request', HttpStatus.BAD_REQUEST);
  }
}
export class FriendNotFoundException extends HttpException {
  constructor() {
    let message = 'Friend request not found';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
export class FriendRequestException extends HttpException {
  constructor() {
    let message = 'Friend request error';
    super(message, HttpStatus.BAD_REQUEST);
  }
}
