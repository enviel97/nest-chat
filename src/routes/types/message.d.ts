interface ResponseMessage {
  message: IMessage;
  members: Set<string>;
}

interface ResponseDeleteMessage extends ResponseMessage {
  lastMessage?: IMessage;
}

interface EmitDeleteMessage {
  lastMessage?: IMessage;
  messageId: string;
  conversationId: string;
  members: Set<string>;
}

interface IMessengerService {
  createMessage(
    messengerCreateParams: MessageCreateParams,
  ): Promise<ResponseMessage>;
  getMessages(
    conversationId: string,
    option: PaginationOption,
  ): Promise<Pagination<IMessage>>;
  deleteMessage(params: MessageDeleteParams): Promise<ResponseDeleteMessage>;
}
