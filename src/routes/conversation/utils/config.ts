export const populateLastMessage = {
  path: 'lastMessage',
  select: '_id content author updatedAt',
  populate: {
    path: 'author',
    select: 'firstName lastName email _id',
  },
};
export const populateParticipant = {
  path: 'participant',
  populate: {
    path: 'members',
    select: 'firstName lastName email _id',
  },
};
