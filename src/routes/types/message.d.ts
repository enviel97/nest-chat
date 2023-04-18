interface ResponseMessage {
  message: IMessage;
  members: Set<string>;
}

interface ResponseMessageWithLastMessage extends ResponseMessage {
  lastMessage?: IMessage;
}

interface EmitDeleteMessage {
  lastMessage?: IMessage;
  messageId: string;
  conversationId: string;
  members: Set<string>;
}

interface IMessengerService {
  createMessage(params: MessageCreateParams): Promise<ResponseMessage>;
  getMessages(
    conversationId: string,
    option: PaginationOption,
  ): Promise<Pagination<IMessage>>;
  editContentMessage(
    params: MessageEditParams,
  ): Promise<ResponseMessageWithLastMessage>;
}
