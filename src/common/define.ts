export const Routes = Object.freeze({
  AUTH: 'auth',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'conversations/:conversationId/messages',
  USERS: 'users',
});

export const Services = Object.freeze({
  AUTH: 'AUTH_SERVICE',
  USERS: 'USER_SERVICE',
  CONVERSATIONS: 'CONVERSATIONS_SERVICE',
  MESSAGES: 'MESSAGES_SERVICE',
  GATEWAY_SESSION: 'GATEWAY_SESSION_MANAGER',
});

export const ModelName = Object.freeze({
  User: 'users',
  Conversation: 'conversations',
  Message: 'messages',
  Participant: 'participants',
});

export const Event = Object.freeze({
  EVENT_MESSAGE_SENDING: 'message.create',
  EVENT_MESSAGE_DELETE: 'message.delete',
  EVENT_MESSAGE_UPDATE: 'message.update',

  EVENT_CONVERSATION_SENDING: 'conversation.create',

  // event listen
  EVENT_USER_TYPING_START: 'onUserTypingStart',
  EVENT_USER_TYPING_STOP: 'onUserTypingStop',
  EVENT_USER_TYPED: 'onUserTyping',

  EVENT_CONNECT_ROOM_CONVERSATION: 'onConnectRoomConversation',
  EVENT_LEAVE_ROOM_CONVERSATION: 'onLeaveRoomConversation',
  EVENT_CONNECTED_ROOM: 'onConnectedRoom',
  EVENT_LEAVED_ROOM: 'onLeavedRoom',
  EVENT_CONVERSATION_CREATED: 'onConversationCreated',

  EVENT_MESSAGE_CREATED: 'onMessageCreated',
  EVENT_MESSAGE_REMOVE: 'onMessageRemove',
  EVENT_MESSAGE_EDITED: 'onMessageEdited',

  EVENT_SOCKET_CONNECTED: 'connected',
});
