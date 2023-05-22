import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseEnumPipe,
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
import type { Response } from 'express';
import { SingleFileValidator } from 'src/adapter/image_storage/validator/SingleFileValidator';
import { Routes, Services } from 'src/common/define';
import { Event2 } from 'src/common/event/event';
import { SearchCache } from 'src/middleware/cache/decorates/SearchCache';
import { ParseUUIDPipe } from 'src/middleware/parse/uuid';
import { UpdateProfileDTO } from 'src/models/profile';
import UpdateStatusDTO from 'src/models/profile/dto/UpdateStatus.DTO';
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

  @Patch('change/status')
  async updateStatus(@AuthUser() user: User, @Body() status: UpdateStatusDTO) {
    const { profile, notChange } = await this.profileService.changeStatus(
      user,
      status,
    );
    this.eventEmitter.emit(Event2.subscribe.PROFILE_CHANGE_STATUS, profile);
    // emit
    return {
      code: notChange ? 304 : 200,
      message: 'Change status profile success',
      data: profile,
    };
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
    this.eventEmitter.emit(Event2.subscribe.PROFILE_UPDATE_INFO, result);
    return result;
  }

  @SkipThrottle()
  @Get(':type/:id')
  async getImage(
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
  // @ResponseSuccess({ code: 206, message: 'Upload avatar success' })
  async uploadImage(
    @Param('type', new ParseEnumPipe(UploadImageType))
    type: UploadImageType,

    @AuthUser()
    user: User,

    @UploadedFile(SingleFileValidator())
    file: Express.Multer.File,
  ) {
    const fileId = imageGenerationUID(`${user.getId()}${type.toUpperCase()}`);
    const profile = await this.profileService.updateProfile(
      user.getId(),
      { [type]: fileId },
      { new: false },
    );

    return await this.imageStorageService
      .uploadImage(fileId, file)
      .then((response) => {
        this.eventEmitter.emit(Event2.subscribe.image_profile.success, {
          user: user.getId(),
          avatar: response.url,
        });
        return {
          code: 206,
          message: 'Upload image successfully',
          data: { ...profile, [type]: fileId, [`${type}Url`]: response.url },
        };
      })
      .catch((error) => {
        Logger.error('Upload image error', error);
        this.eventEmitter.emit(
          Event2.subscribe.image_profile.error,
          user.getId(),
        );
        throw new BadRequestException('Upload image failure');
      });
  }
}
