interface NewConversationProps {
  authorId: string;
  idParticipants: string[];
}

interface NewMessageProps {
  content?: string;
  conversationId: string;
  author: User;
}
