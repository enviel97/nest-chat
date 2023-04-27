import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseEnumPipe,
  ParseFilePipe,
  Patch,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import type { Queue } from 'bull';
import type { Response } from 'express';
import { Routes, Services } from 'src/common/define';
import { QueuesModel } from 'src/common/queues';
import { SearchCache } from 'src/middleware/cache/decorates/SearchCache';
import { ParseUUIDPipe } from 'src/middleware/parse/uuid';
import { UpdateProfileDTO } from 'src/models/profile';
import { AuthUser, ResponseSuccess } from 'src/utils/decorates';
import { mapToResponse } from 'src/utils/map';
import { AuthenticateGuard } from '../../auth/utils/Guards';
import { imageGenerationUID } from '../utils/image';

enum UploadImageType {
  avatar = 'avatar',
  banner = 'banner',
}

@Controller(Routes.PROFILE)
@UseGuards(AuthenticateGuard)
export class ProfileController {
  constructor(
    @Inject(Services.PROFILE)
    private readonly profileService: IProfileService,

    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,

    @InjectQueue(QueuesModel.FILE_HANDLER)
    private readonly fileHandlerQueue: Queue,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('friends')
  async getListFriends(@AuthUser() user: User) {
    const { friends } = await this.profileService.listFriends(user.getId());

    return {
      code: 200,
      data: friends,
      message: 'Get list friend successfully',
    };
  }

  @SearchCache()
  @Get('search')
  async searchProfile(@AuthUser() user: User, @Query('query') query: string) {
    if (!query) throw new BadRequestException('Query is invalid');
    const result = await this.profileService.searchFriend(
      user.getId(),
      query.trim(),
    );

    return mapToResponse({
      code: 200,
      data: result,
    });
  }

  @Get('')
  async getProfile(@AuthUser() user: User) {
    const result = await this.profileService.getProfile(user.getId());
    return mapToResponse({
      code: 200,
      data: result,
    });
  }

  @Patch('update')
  @ResponseSuccess({ code: 200, message: 'Update profile successfully' })
  async updateProfile(
    @AuthUser() user: User,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    const result = await this.profileService.updateProfile(
      user.getId(),
      updateProfileDTO,
    );

    return result;
  }

  @SkipThrottle()
  @Get(':type/:id')
  async getAvatar(
    @Param('type', new ParseEnumPipe(UploadImageType))
    type: UploadImageType,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('size') viewPort: ViewPort,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, contentType } = await this.imageStorageService.getImage(
      id,
      type,
      viewPort,
    );
    res.contentType(contentType ?? 'image/jpeg');
    return new StreamableFile(buffer);
  }

  @Patch('update/:type')
  @UseInterceptors(FileInterceptor('image'))
  @ResponseSuccess({ code: 206, message: 'Upload avatar success' })
  async updateAvatar(
    @Param('type', new ParseEnumPipe(UploadImageType))
    type: UploadImageType,
    @AuthUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(image\/)(jpg|png|jpeg|webp)/g }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileId = imageGenerationUID(user.getId(), type.toUpperCase());
    const result = await this.profileService.updateProfile(
      user.getId(),
      { avatar: fileId },
      { new: false },
    );
    this.fileHandlerQueue.add(
      'upload:image',
      { fileId, file, profile: result },
      {
        removeOnComplete: true,
        removeOnFail: true,
        priority: 1,
        timeout: 1000 * 60 * 60, // 1 hours
      },
    );
    return { ...result, avatar: fileId };
  }
}
