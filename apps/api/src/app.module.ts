import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'data'),
      serveRoot: '/downloads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.apk')) {
            const name = filePath.endsWith('planner.apk') ? 'planner.apk' : 'event.apk';
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'public, max-age=300');
          }
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/{*path}', '/downloads/{*path}'],
      serveStaticOptions: {
        index: 'index.html',
      },
      renderPath: '/{*path}',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
