import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { Injectables } from '../interfaces/injectables';
import { IDocumentService } from '../interfaces/document.service.interface';
import { SuccessResponseDto } from '../utils/success-response.dto';
import { GenerateUploadUrlDto } from './dtos/generate-upload-url.dto';
import { SkipAuth } from '../utils/meta/skip-auth';

@Controller('documents')
export class DocumentsController {
  constructor(
    @Inject(Injectables.DOCUMENT_SERVICE)
    public documentsService: IDocumentService,
  ) {}

  @Post('upload_url')
  async generateUploadUrl(
    @Body() payload: GenerateUploadUrlDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.documentsService.generateSignedUrl(payload);
    return new SuccessResponseDto(
      'Generated Upload URL Successfully',
      response,
    );
  }

  @SkipAuth()
  @Get('r|^/files/(\\\\w+)/(\\\\w+)/(\\\\w+\\\\.\\\\w+)$|')
  async getFile(@Req() req: Request) {
    const key = req.url.split('files/')[1];
    const response = await this.documentsService.getFile(key);
    return new SuccessResponseDto(
      'Generated Download URL Successfully',
      response,
    );
  }

  @Delete('r|^/files/(\\\\w+)/(\\\\w+)/(\\\\w+\\\\.\\\\w+)$|')
  async deleteFile(@Req() req: Request): Promise<SuccessResponseDto> {
    const key = req.url.split('files/')[1];
    const response = await this.documentsService.deleteFile(key);
    return new SuccessResponseDto('File Delete Successfully', response);
  }
}
