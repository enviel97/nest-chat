export const Routes = Object.freeze({
  AUTH: 'auth',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
});

export const Services = Object.freeze({
  AUTH: 'AUTH_SERVICE',
  USERS: 'USER_SERVICE',
  CONVERSATIONS: 'CONVERSATIONS_SERVICE',
  MESSAGES: 'MESSAGES_SERVICE',
});

export const ModelName = Object.freeze({
  User: 'users',
  Conversation: 'conversations',
  Message: 'messages',
});

export const Event = Object.freeze({
  EMIT_MESSAGE_SENDING: 'message.create',
  EMIT_NOTIFICATION_MESSAGE: 'message.notification',

  // Event name
  EVENT_CREATE_MESSAGE: 'createMessage',
  EVENT_SOCKET_CONNECTED: 'connected',
});
