export const Routes = Object.freeze({
  AUTH: 'auth',
  CONVERSATIONS: 'conversations',
  PARTICIPANT: 'conversations/:id/participants',
  MESSAGES: 'conversations/:conversationId/messages',
  USERS: 'users',
  FRIEND_REQUEST: 'users/friend',
  PROFILE: 'users/profile',
});

export const Services = Object.freeze({
  AUTH: 'AUTH_SERVICE',
  USERS: 'USER_SERVICE',
  CONVERSATIONS: 'CONVERSATIONS_SERVICE',
  MESSAGES: 'MESSAGES_SERVICE',
  GATEWAY_SESSION: 'GATEWAY_SESSION_MANAGER',
  PARTICIPANT: 'PARTICIPANT_SERVICE',
  FRIEND_REQUEST: 'FRIEND_REQUEST_SERVICE',
  PROFILE: 'PROFILE_SERVICE',
  REDIS: Symbol('SESSION:REDIS'),
  APP_GUARD: 'APP_GUARD',
  IMAGE_STORAGE: 'IMAGE_STORAGE',
});

export const ModelName = Object.freeze({
  User: 'users',
  Conversation: 'conversations',
  Message: 'messages',
  Participant: 'participants',
  FriendRequest: 'friendRequests',
  Profile: 'profiles',
});

export const Event = Object.freeze({
  EVENT_MESSAGE_SENDING: 'message.create',
  EVENT_MESSAGE_DELETE: 'message.delete',
  EVENT_MESSAGE_UPDATE: 'message.update',

  EVENT_CONVERSATION_SENDING: 'conversation.create',
  EVENT_CONVERSATION_LEAVE: 'conversation.leave',
  EVENT_CONVERSATION_ADD_MEMBER: 'conversation.addMember',
  EVENT_CONVERSATION_BANNED_MEMBER: 'conversation.bannedMember',

  EVENT_PARTICIPANT_GET_STATUS: 'participant.getStatus',

  EVENT_FRIEND_SEND_REQUEST: 'friend-request.ack',
  EVENT_FRIEND_REQUEST_CANCEL: 'friend-request.cancel',

  // event listen
  EVENT_USER_TYPING_START: 'onUserTypingStart',
  EVENT_USER_TYPING_STOP: 'onUserTypingStop',
  EVENT_USER_TYPED: 'onUserTyping',

  EVENT_CONNECT_ROOM_CONVERSATION: 'onConnectRoomConversation',
  EVENT_LEAVE_ROOM_CONVERSATION: 'onLeaveRoomConversation',
  EVENT_CONNECTED_ROOM: 'onConnectedRoom',
  EVENT_LEAVED_ROOM: 'onLeavedRoom',
  EVENT_CONVERSATION_CREATED: 'onConversationCreated',
  EVENT_CONVERSATION_LEAVE_GROUP: 'onConversationLeaving',
  EVENT_NOTIFICATION_CHANGE_STATUS: 'onNotificationChangeStatus',
  EVENT_REMOVE_NEW_MEMBERS: 'onRemoveMember',
  EVENT_BANNED_USER: 'onBannedUser',

  EVENT_MESSAGE_CREATED: 'onMessageCreated',
  EVENT_MESSAGE_REMOVE: 'onMessageRemove',
  EVENT_MESSAGE_EDITED: 'onMessageEdited',

  EVENT_PARTICIPANT_STATUS_RESPONSE: 'onParticipantStatusResponse',

  EVENT_FRIEND_RECEIVE_FRIEND_REQUEST: 'onReceiveFriendRequest',
  EVENT_FRIEND_RECEIVE_ALLOW_FRIEND: 'onReceiveAllowFriendRequest',
  EVENT_FRIEND_RECEIVE_REJECT_FRIEND: 'onReceiveRejectFriendRequest',
  EVENT_FRIEND_RECEIVE_CANCEL_FRIEND_REQUEST: 'onReceiveCancelFriendRequest',

  EVENT_SOCKET_CONNECTED: 'connected',
  EVENT_FRIEND_LIST_STATUS: 'onFriendListStatus',
  EVENT_FRIEND_LIST_RETRIEVE: 'onFriendListRetrieve',
});
