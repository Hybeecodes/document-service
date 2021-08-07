import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AwsService } from './services/aws/aws.service';
import { Injectables } from './interfaces/injectables';
import { DocumentsController } from './documents/documents.controller';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './utils/guards/auth.guard';
import { LoggingInterceptor } from './utils/logging.interceptor';
import { HttpErrorFilter } from './utils/http-error-filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, DocumentsController],
  providers: [
    AppService,
    { provide: Injectables.DOCUMENT_SERVICE, useClass: AwsService },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}
