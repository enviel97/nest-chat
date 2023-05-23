export const populateLastMessage = {
  path: 'lastMessage',
  select: 'content author updatedAt',
  populate: {
    path: 'author',
    select: 'firstName lastName email',
  },
};

export const populateMember = {
  path: 'members',
  select: 'firstName lastName email profile',
  populate: {
    path: 'profile',
    select: 'avatar displayName',
  },
};

export const populateParticipant = {
  path: 'participant',
  populate: {
    ...populateMember,
  },
};
