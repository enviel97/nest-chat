// https://docs.imagekit.io/features/image-transformations

type ViewPort = 'default' | 's' | 'sm' | 'md' | 'lg' | 'xl';
type UploadImageType = 'avatar' | 'banner' | 'normal';
interface FetchImageResponse {
  contentType: string;
  buffer: Buffer;
}

interface CloudinaryErrorResponse {
  message: string;
  name: string;
  http_code: number;
  [future: string]: string;
}

interface CloudinarySuccessResponse {
  url: string;
  publicId: string;
  createdAt: string;
  [future: string]: string;
}

type CloudinaryResponse = CloudinaryErrorResponse | CloudinarySuccessResponse;
type MediaData = Express.Multer.File;

interface IImageStorageService {
  deleteImage(public_id: string): Promise;
  uploadImage(public_id: string, file: MediaData): Promise<CloudinaryResponse>;
  getImage(
    public_id: string,
    type: UploadImageType,
    viewPort?: ViewPort,
  ): Promise<FetchImageResponse>;
}
