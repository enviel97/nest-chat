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
  GATEWAY_SESSION: 'GATEWAY_SESSION_MANAGER',
});

export const ModelName = Object.freeze({
  User: 'users',
  Conversation: 'conversations',
  Message: 'messages',
});

export const Event = Object.freeze({
  EVENT_MESSAGE_SENDING: 'message.create',
  EVENT_NOTIFICATION_MESSAGE: 'message.notification',
  EVENT_USER_TYPING: 'onUserTyping',
  EVENT_CONNECT_ROOM_CONVERSATION: 'onConnectRoomConversation',
  EVENT_CREATE_MESSAGE: 'createMessage',
  EVENT_SOCKET_CONNECTED: 'connected',
});
