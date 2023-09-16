type Role = 'Admin' | 'Member';

type ParticipantMembers = string | User;

type ParticipantRole = { [key: string]: Role };

interface ParticipantDetail<T extends ParticipantMembers> {
  members: T[];
  roles: ParticipantRole;
}

type IParticipant<T> = ParticipantDetail<T> & Identity;

type Participant<T> = Partial<IParticipant<T>>;
