interface IMessengerService {
  createMessage(messengerCreateParams: MessageCreateParams): Promise<IMessage>;
  getMessages(conversationId: string): Promise<IMessage[]>;
}
