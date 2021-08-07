import { GenerateUploadUrlDto } from '../documents/dtos/generate-upload-url.dto';

export interface IDocumentService {
  generateSignedUrl(payload: GenerateUploadUrlDto): Promise<any>;
  getDownloadUrl(): Promise<any>;
  deleteFile(Key: string): Promise<any>;
  getFile(Key: string): Promise<any>;
}
