interface CallPayload {
  callId: string;
  receiver: string;
}

interface AcceptCallPayload {
  callId: string;
  caller: string;
}

interface RejectCallPayload {
  callId: string;
  connecterId: string;
}

interface ControllerCallPayload extends RejectCallPayload {
  type: 'microphone' | 'camera';
  enable: boolean;
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
type CallFailure = 'user-unavailable' | 'peer-unavailable';

interface P2PErrorServicesPayload {
  to: string;
  callId: string;
}
