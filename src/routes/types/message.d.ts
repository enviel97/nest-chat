interface IMessengerService {
  createMessage(messengerCreateParams: MessageCreateParams): Promise<IMessage>;
  getMessages(
    conversationId: string,
    option: PaginationOption,
  ): Promise<Pagination<IMessage>>;
}
