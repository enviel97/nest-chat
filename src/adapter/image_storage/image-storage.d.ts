// https://docs.imagekit.io/features/image-transformations

type ViewPort = 'default' | 's' | 'sm' | 'md' | 'lg' | 'xl';

interface FetchImageResponse {
  contentType: string;
  buffer: Buffer;
}

interface IImageStorageService {
  uploadImage(
    fileName: string,
    file: Express.Multer.File,
  ): Promise<ImageKit<any>>;
  getImageAvatar(
    fileName: string,
    viewPort?: ViewPortAvatar,
  ): Promise<FetchImageResponse>;
  getImageBanner(
    fileName: string,
    viewPort?: string,
  ): Promise<FetchImageResponse>;
}
