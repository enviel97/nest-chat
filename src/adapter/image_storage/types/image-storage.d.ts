// https://docs.imagekit.io/features/image-transformations

type ViewPort = 'default' | 's' | 'sm' | 'md' | 'lg' | 'xl';
type UploadImageType = 'avatar' | 'banner';
interface FetchImageResponse {
  contentType: string;
  buffer: Buffer;
}
