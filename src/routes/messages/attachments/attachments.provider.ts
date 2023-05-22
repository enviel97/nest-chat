import { Services } from 'src/common/define';
import { AttachmentsServices } from './attachments.services';

export const AttachmentsProvider = {
  provide: Services.ATTACHMENTS,
  useClass: AttachmentsServices,
};
