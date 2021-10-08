import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IDocumentService } from '../../interfaces/document.service.interface';
import { ConfigService } from '@nestjs/config';
import * as S3 from 'aws-sdk/clients/s3';
import { GenerateUploadUrlDto } from '../../documents/dtos/generate-upload-url.dto';
import {
  generateKeyName,
  generateRandomFileName,
  getExtensionFromFilename,
} from '../../utils/helpers';
import { GenerateUploadUrlResponseDto } from '../../documents/dtos/generate-upload-url-response.dto';
import { UploadFileDto } from '../../documents/dtos/upload-file.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsService implements IDocumentService {
  private readonly logger: Logger;
  private readonly s3Client: S3;
  private readonly BUCKET_NAME: string;
  private readonly REGION: string;

  constructor(private readonly config: ConfigService) {
    this.logger = new Logger(this.constructor.name);
    this.s3Client = new S3({
      apiVersion: 'latest',
      credentials: {
        accessKeyId: this.config.get('ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('SECRET_ACCESS_KEY'),
      },
      region: this.config.get('REGION'),
    });
    this.BUCKET_NAME = this.config.get('BUCKET_NAME');
    this.REGION = this.config.get('REGION');
  }
  async deleteFile(Key: string): Promise<any> {
    try {
      return await this.deleteFileWithKey(Key);
    } catch (e) {
      this.logger.error(`Unable to Delete File: ${JSON.stringify(e)}`);
      throw new HttpException(
        'Unable to Delete File',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private deleteFileWithKey(Key: string) {
    return new Promise((resolve, reject) => {
      this.s3Client.deleteObject(
        {
          Bucket: this.BUCKET_NAME,
          Key,
        },
        (err, data) => {
          if (err) {
            reject(err);
          }
          if (data) {
            resolve(data);
          }
        },
      );
    });
  }

  async generateSignedUrl(
    payload: GenerateUploadUrlDto,
  ): Promise<GenerateUploadUrlResponseDto> {
    try {
      const { filename, uploadPath } = payload;
      const extension = getExtensionFromFilename(filename);
      const { fileName } = generateRandomFileName(20, extension);
      const Key = generateKeyName(fileName, uploadPath);
      const signedUrl = await this.s3Client.getSignedUrlPromise('putObject', {
        Bucket: this.BUCKET_NAME,
        Key,
        Expires: 1000,
      });
      const generateUploadUrlResponseDto = new GenerateUploadUrlResponseDto();
      generateUploadUrlResponseDto.signedUrl = signedUrl;
      generateUploadUrlResponseDto.key = this.generateFileUrlFromKey(Key);
      generateUploadUrlResponseDto.fileName = fileName;
      generateUploadUrlResponseDto.originalFileName = filename;
      return generateUploadUrlResponseDto;
    } catch (e) {
      this.logger.error(`Unable to Generate Signed URL: ${e.message}`);
      throw new HttpException(
        'Unable to Generate Signed URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadFile(file: Express.Multer.File, payload: UploadFileDto) {
    const { uploadPath } = payload;
    console.log(file);
    try {
      const fileNameArray = file.originalname.split('.');
      const ext = fileNameArray[fileNameArray.length - 1];
      const key = `${uploadPath}/${uuidv4()}.${ext}`;
      const { Key, Location, ETag } = await this.s3Client
        .upload({
          Bucket: this.BUCKET_NAME,
          Key: key,
          ACL: 'public-read',
          Body: file.buffer,
        })
        .promise();
      return {
        uploadPath: Key,
        location: Location,
        tag: ETag,
      };
    } catch (e) {
      this.logger.error(`Unable to Upload File: ${e.message}`);
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getDownloadUrl(): Promise<any> {
    return Promise.resolve(undefined);
  }

  async getFile(Key: string): Promise<any> {
    try {
      return await this.s3Client.getSignedUrlPromise('getObject', {
        Bucket: this.BUCKET_NAME,
        Key,
      });
    } catch (e) {
      this.logger.error(`Unable to Generate Download URL: ${e.message}`);
      throw new HttpException(
        'Unable to Generate Download URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public generateFileUrlFromKey(key: string): string {
    return `https://${this.BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${key}`;
  }
}
