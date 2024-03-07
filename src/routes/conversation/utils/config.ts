export const populateLastMessage = {
  path: 'lastMessage',
  select: 'content author updatedAt attachments._id',
  populate: {
    path: 'author',
    select: 'lastName',
  },
};

export const populateMember = {
  path: 'participant.members',
  select: 'firstName lastName email profile',
  populate: {
    path: 'profile',
    select: 'avatar displayName',
  },
};
