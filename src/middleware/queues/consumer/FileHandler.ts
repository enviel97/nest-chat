import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { Services } from 'src/common/define';
import { QueuesEvent, QueuesModel } from 'src/common/queues';

interface JobData {
  fileId: string;
  file: Express.Multer.File;
  profile: Profile<User>;
}

@Processor(QueuesModel.FILE_HANDLER)
export class FileHandlerConsumer {
  constructor(
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,

    @Inject(Services.PROFILE)
    private readonly profileService: IProfileService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('upload:image')
  async uploadImage(job: Job<JobData>) {
    try {
      const { fileId, file, profile } = job.data;

      if (profile.avatar?.split('+').at(1)) {
        this.imageStorageService
          .deleteImage(profile.avatar?.split('+')[1])
          .catch(() => {
            console.log('ERROR::Delay delete old image failure');
          });
      }
      const result = await this.imageStorageService.uploadImage(fileId, file);

      return result;
    } catch (error) {
      throw error;
    }
  }

  @OnQueueCompleted()
  async onSuccess(job: Job<JobData>) {
    try {
      const { fileId, profile } = job.data;
      const result = job.returnvalue as { fileId: string };
      const updateValue = await this.profileService.updateProfile(
        profile.user.getId(),
        { avatar: `${fileId}+${result.fileId}` },
      );
      Logger.log(job.returnvalue, 'File upload successfully');
      // TODO: upload image here
      this.eventEmitter.emit(QueuesEvent.IMAGE_UPLOAD_SUCCESS, {
        user: profile.user.getId(),
        avatar: `${fileId}+${result.fileId}`,
      });
      return {
        ...updateValue,
        ...job.returnvalue,
      };
    } catch (error) {
      Logger.error(
        job.failedReason ?? error.message,
        job.failedReason ? 'Job:::Upload Image' : 'Native:::Upload Image',
      );
    }
  }

  @OnQueueFailed()
  async onError(job: Job<JobData>, err: Error) {
    const { profile } = job.data;
    this.eventEmitter.emit(
      QueuesEvent.IMAGE_UPLOAD_ERROR,
      profile.user.getId(),
    );

    Logger.error(
      job.failedReason ?? err.message,
      job.failedReason ? 'Job:::Upload Image' : 'Native:::Upload Image',
    );
    await job.remove();
  }
}
