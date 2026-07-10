import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { join } from 'path';

const ASSET_EXT = /\.[a-z0-9]+$/i;

@Controller()
export class SpaController {
  @Get('*')
  fallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const path = req.path.split('?')[0];
    if (path.startsWith('/api') || path.startsWith('/downloads')) {
      return next();
    }

    if (ASSET_EXT.test(path)) {
      return res.status(404).end();
    }

    return res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
