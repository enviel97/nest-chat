interface CallPayload {
  receiver: string;
}

interface AcceptCallPayload {
  caller: string;
}

interface CallInfo {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

interface VideoCallPayload {
  user: CallInfo;
  callId: string;
}
// success
type CallSuccess = 'calling' | 'reject' | 'accept';

interface VideoCallEmit {
  type: CallSuccess;
  data: VideoCallPayload;
}

// error
type CallFailure = 'user-unavailable' | 'p2p-unavailable';

interface P2PErrorServicesPayload {
  to: string;
  callId: string;
}
