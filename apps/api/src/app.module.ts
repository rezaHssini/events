import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpaController } from './spa.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'data'),
      serveRoot: '/downloads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="event.apk"');
          }
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/{*path}', '/downloads/{*path}'],
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController, SpaController],
  providers: [AppService],
})
export class AppModule {}
