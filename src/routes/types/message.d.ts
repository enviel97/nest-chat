interface CreateMessageServices {
  message: IMessage;
  members: Set<string>;
}

interface IMessengerService {
  createMessage(
    messengerCreateParams: MessageCreateParams,
  ): Promise<CreateMessageServices>;
  getMessages(
    conversationId: string,
    option: PaginationOption,
  ): Promise<Pagination<IMessage>>;
}
