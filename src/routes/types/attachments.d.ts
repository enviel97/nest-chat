interface IAttachmentServices {
  generateId(file: MediaData): string;
  creates(attachments: MediaData[]): Promise<IMessageAttachment[]>;
  deletes(attachments: MessageAttachment[]): void;
}
