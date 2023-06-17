import string from 'src/utils/string';

export function createRoles(ids: string[], adminId: string) {
  const roles = ids.reduce((acc, obj) => {
    const isAdmin = string.getId(obj) === adminId;
    acc[string.getId(obj)] = isAdmin ? 'Admin' : 'Member';
    return acc;
  }, {});
  return roles;
}

export function createNameConversation(
  users: User[],
  options?: { type?: 'group' | 'direct' },
) {
  const { type = 'direct' } = options ?? {};
  if (type === 'direct') return '';
  return `Group of ${users.map((user) => user.lastName).join(', ')}`;
}
