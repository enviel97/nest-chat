export const Event2 = Object.freeze({
  client: {
    FRIEND_REQUEST_QUANTITY: 'get.quantity',
    // Call
    CALL_VIDEO_CALLING: 'call.videoCalling',
    CALL_VIDEO_CALL_ACCEPT: 'call.videoCalling.accept',
    CALL_VIDEO_CALL_REJECT: 'call.videoCalling.reject',
    CALL_VIDEO_P2P_ERROR: 'call.error.p2pServices',
    CALL_VIDEO_DEVICE_PERMISSION: 'call.error.userDevices',
    CALL_VIDEO_MODIFY_DEVICES: 'call.modify.devices',
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

    // Call
    CALL_VIDEO_CALLING: 'onVideoCalling',
    CALL_VIDEO_CALL_ACCEPT: 'onVideoCallAccept',
    CALL_VIDEO_CALL_REJECT: 'onVideoCallReject',
    CALL_VIDEO_CALL_ERROR: 'onVideoCallError',
    CALL_VIDEO_MODIFY_DEVICES: 'onModifyDevices',
  },
});
