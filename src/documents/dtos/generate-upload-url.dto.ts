import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  uploadPath: string;
}
