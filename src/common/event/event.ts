export const Event2 = Object.freeze({
  client: {
    FRIEND_REQUEST_QUANTITY: 'get.quantity',
  },

  // server subscribe
  subscribe: {
    // Profile
    PROFILE_CHANGE_STATUS: 'profile.update.status',
    PROFILE_UPDATE_INFO: 'profile.update.info',
    image_profile: {
      error: 'image.error',
      success: 'image.success',
    },
  },

  // server emit to client
  emit: {
    PROFILE_UPLOAD_IMAGE: 'onFriendUploadImage',
    PROFILE_UPDATE: 'onFriendUploadProfile',
    image_profile: {
      error: 'image_profile_upload_error',
      success: 'image_profile_upload_success',
    },
  },
});
