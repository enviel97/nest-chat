export const Event2 = Object.freeze({
  client: {
    FRIEND_REQUEST_QUANTITY: 'get.quantity',
  },

  // server subscribe
  subscribe: {
    // Profile
    PROFILE_CHANGE_STATUS: 'profile.update.status',
    PROFILE_UPDATE_IMAGE: 'profile.update.image',
    PROFILE_UPDATE_INFO: 'profile.update.info',
  },

  // server emit to client
  emit: {
    PROFILE_UPLOAD_IMAGE: 'onFriendUploadImage',
    PROFILE_UPDATE: 'onFriendUploadProfile',
  },
});
