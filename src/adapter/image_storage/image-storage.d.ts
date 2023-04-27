// https://docs.imagekit.io/features/image-transformations

type ViewPort = 'default' | 's' | 'sm' | 'md' | 'lg' | 'xl';
type UploadImageType = 'avatar' | 'banner';
interface FetchImageResponse {
  contentType: string;
  buffer: Buffer;
}

interface IImageStorageService {
  deleteImage(fileId: string): Promise<any>;
  uploadImage(
    fileName: string,
    file: Express.Multer.File,
  ): Promise<ImageKit<any>>;
  getImage(
    fileName: string,
    type: UploadImageType,
    viewPort?: ViewPortAvatar,
  ): Promise<FetchImageResponse>;
}
