interface EmitDeleteMessage {
  lastMessage?: IMessage;
  messageId: string;
  conversationId: string;
  members: Set<string>;
}

interface MessageRequest extends Request {
  conversation: Conversation;
}

interface IMessengerService {
  createMessage(params: MessageCreateParams): Promise<Message>;
  getMessages(
    conversationId: string,
    option: PaginationOption,
  ): Promise<Pagination<IMessage>>;
  editContentMessage(params: MessageEditParams): Promise<Message>;
}
