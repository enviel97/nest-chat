export const populateLastMessage = {
  path: 'lastMessage',
  select: '_id content author updatedAt',
  populate: {
    path: 'author',
    select: 'firstName lastName email profile',
    populate: {
      path: 'profile',
      select: 'avatar displayName',
    },
  },
};

export const populateMember = {
  path: 'members',
  select: 'firstName lastName email',
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
