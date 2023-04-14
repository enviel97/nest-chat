type ImageKitExtensionStatus = 'success' | 'failed' | 'pending';

interface AITags {
  name: string;
  confidence: string;
  source: string;
}
interface VersionInfo {
  id: string;
  name: string;
}

interface ImageKit<CustomMeta extends any> {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  mime: string;
  size: number;

  height?: number;
  width?: number;
  hasAlpha?: boolean;

  tag?: string[];
  AITags?: AITags[];
  versionInfo?: VersionInfo;
  isPrivateFile?: boolean;
  customCoordinates?: any;
  customMetadata?: CustomMeta;

  // Format: YYYY-MM-DDTHH:mm:ss.sssZ
  createdAt: string;
  updatedAt: string;
  extensionStatus?: ImageKitExtensionStatus;
}
