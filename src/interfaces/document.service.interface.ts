import { GenerateUploadUrlDto } from '../documents/dtos/generate-upload-url.dto';
import { UploadFileDto } from '../documents/dtos/upload-file.dto';

export interface IDocumentService {
  generateSignedUrl(payload: GenerateUploadUrlDto): Promise<any>;
  getDownloadUrl(): Promise<any>;
  deleteFile(Key: string): Promise<any>;
  getFile(Key: string): Promise<any>;
  uploadFile(file: Express.Multer.File, payload: UploadFileDto): Promise<any>;
}
