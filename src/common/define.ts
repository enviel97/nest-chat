export const Routes = Object.freeze({
  AUTH: 'auth',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'conversations/:conversationId/messages',
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
  EVENT_MESSAGE_DELETE: 'message.delete',

  EVENT_CONVERSATION_SENDING: 'conversation.create',

  // event listen
  EVENT_USER_TYPING: 'onUserTyping',
  EVENT_CONNECT_ROOM_CONVERSATION: 'onConnectRoomConversation',
  EVENT_CONVERSATION_CREATED: 'onConversationCreated',
  EVENT_MESSAGE_CREATED: 'onMessageCreated',

  EVENT_SOCKET_CONNECTED: 'connected',
});
