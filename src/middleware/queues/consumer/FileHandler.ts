import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { Services } from 'src/common/define';
import { QueuesEvent, QueuesModel } from 'src/common/queues';

@Processor(QueuesModel.FILE_HANDLER)
export class FileHandlerConsumer {
  constructor(
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('upload:image')
  async uploadImage(job: Job) {
    try {
      const { fileId, file } = job.data;
      const result = await this.imageStorageService.uploadImage(fileId, file);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @OnQueueFailed()
  async onError(job: Job, err: Error) {
    const { id } = job.data;
    this.eventEmitter.emit(QueuesEvent.IMAGE_UPLOAD_ERROR, id);
    await job.remove();
  }
}
