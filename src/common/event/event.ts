export const Event2 = Object.freeze({
  client: {
    FRIEND_REQUEST_QUANTITY: 'get.quantity',
  },

  // server subscribe
  subscribe: {
    // Message
    EVENT_MESSAGE_UPDATE_LAST_MESSAGE: 'message.update_last_message',

    // Profile
    PROFILE_CHANGE_STATUS: 'profile.update.status',
    PROFILE_UPDATE_INFO: 'profile.update.info',

    image_profile: 'image.upload',
  },

  // server emit to client
  emit: {
    // Message
    EVENT_MESSAGE_UPDATE_LAST_MESSAGE: 'onUpdateLastMessage',

    // Profile
    PROFILE_UPLOAD_IMAGE: 'onFriendUploadImage',
    PROFILE_UPDATE: 'onFriendUploadProfile',
    image_profile: 'onFriendUploadImage',
  },
});
