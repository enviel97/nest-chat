import { Inject, Injectable } from '@nestjs/common';
import { Services } from 'src/common/define';
import { imageGenerationUID } from 'src/routes/user/utils/image';
@Injectable()
export class AttachmentsServices implements IAttachmentServices {
  constructor(
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  generateId(file: MediaData): string {
    const unique = true;
    return imageGenerationUID(file.originalname, unique);
  }

  async deletes(attachments: MessageAttachment[]): Promise<void> {
    await Promise.all(
      attachments.map(({ publicId }) => {
        return this.imageStorageService.deleteImage(publicId);
      }),
    );
  }

  async creates(attachments: MediaData[]): Promise<IMessageAttachment[]> {
    const attachmentsStream = await Promise.all(
      attachments.map((attachment) => {
        const id = this.generateId(attachment);
        return this.imageStorageService
          .uploadImage(id, attachment)
          .then((cloudinary) => {
            return {
              downloadLink: cloudinary.url,
              publicId: id,
              type: attachment.mimetype,
              originName: attachment.filename,
              size: Number(attachment.size),
            };
          });
      }),
    );
    return attachmentsStream;
  }
}
