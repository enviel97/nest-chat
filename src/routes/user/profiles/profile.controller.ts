import {
  BadRequestException,
  Body,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Inject,
  Param,
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
import type { Response } from 'express';
import { Routes, Services } from 'src/common/define';
import { ParseUUIDPipe } from 'src/middleware/parse/uuid';
import { UpdateProfileDTO } from 'src/models/profile';
import { AuthUser, SearchCache } from 'src/utils/decorates';
import { mapToResponse } from 'src/utils/map';
import { AuthenticateGuard } from '../../auth/utils/Guards';
import { imageGenerationUID } from '../utils/image';

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

  @Patch('update')
  async updateProfile(
    @AuthUser() user: User,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    const result = await this.profileService.updateProfile(
      user.getId(),
      updateProfileDTO,
    );

    return mapToResponse({
      code: 200,
      data: result,
    });
  }

  @Get('avatar/:id')
  async getAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('size') viewPort: ViewPort,
    @Res({ passthrough: true }) res: Response,
  ) {
    // TODO: add cache layout in redis
    // TTL 30day
    const { buffer, contentType } =
      await this.imageStorageService.getImageAvatar(id, viewPort);
    res.contentType(contentType ?? 'image/jpeg');
    return new StreamableFile(buffer);
  }

  @Get('banner/:id')
  async getBanner(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('size') viewPort: ViewPort,
    @Res({ passthrough: true }) res: Response,
  ) {
    // TODO: add cache layout in redis
    // TTL 30day
    const { buffer, contentType } =
      await this.imageStorageService.getImageBanner(id, viewPort);
    res.contentType(contentType ?? 'image/jpeg');
    return new StreamableFile(buffer);
  }

  @Patch('update/banner')
  @UseInterceptors(FileInterceptor('banner'))
  async updateBanner(
    @AuthUser() user: User,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    const fileId = imageGenerationUID(user.getId(), 'Banner');
    const image = await this.imageStorageService.uploadImage(fileId, banner);
    const result = await this.profileService.updateProfile(user.getId(), {
      avatar: image.name,
    });
    return mapToResponse({
      code: 200,
      data: result,
    });
  }

  @Patch('update/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @AuthUser() user: User,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const fileId = imageGenerationUID(user.getId(), 'Avatar');
    const image = await this.imageStorageService.uploadImage(fileId, avatar);
    const result = await this.profileService.updateProfile(user.getId(), {
      avatar: image.name,
    });
    return mapToResponse({
      code: 200,
      data: result,
    });
  }
}
