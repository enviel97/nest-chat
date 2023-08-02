import { Event2 } from 'src/common/event/event';
import type { AuthenticationSocket } from '../gateway.session';

type CallEventProps = { [key in CallSuccess | CallFailure]: string };
const CallEvent = Object.freeze<CallEventProps>({
  // Success
  calling: Event2.emit.CALL_VIDEO_CALLING,
  accept: Event2.emit.CALL_VIDEO_CALL_ACCEPT,
  reject: Event2.emit.CALL_VIDEO_CALL_REJECT,
  // Error
  'peer-unavailable': Event2.emit.CALL_VIDEO_CALL_ERROR,
  'user-unavailable': Event2.emit.CALL_VIDEO_CALL_ERROR,
});

export function callEmit<T>(
  socket: AuthenticationSocket,
  type: CallSuccess | CallFailure,
  data?: T,
) {
  socket.emit(CallEvent[type], {
    type,
    ...(data && { data }),
  });
}
