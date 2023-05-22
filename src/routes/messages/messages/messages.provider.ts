import { Services } from 'src/common/define';
import { MessagesService } from './messages.service';

export const MessageProvider = {
  provide: Services.MESSAGES,
  useClass: MessagesService,
};
