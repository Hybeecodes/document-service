import { IsDefined, IsString } from 'class-validator';

export class UploadFileDto {
  @IsDefined()
  @IsString()
  uploadPath: string;
}
