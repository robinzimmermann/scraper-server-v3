import { Request, Response } from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { HttpException } from '../../models/httpException.model';

// console.log('loading src/controllers/v3/controller.ts');
//
import { publicDir } from '../../globals';
// const __dirname = path.dirname(fileURLToPath(import.meta.url)) + '/public';
// console.log(`global publicDir = ${publicDir}`);
// import { publicDir } from '../../../server';
// const publicDir = '';

const rootHandler = (_req: Request, res: Response): void => {
  // res.status(200).send('v3 root');
  // res.sendFile(
  //   '/Users/rozimmermann/doc/2021.10.18_Craigslist-scraper/express-api-starter-ts/public/v3.html',
  // );
  res.sendFile(`${publicDir}/v3.html`);
};

const isAliveHandler = (_req: Request, res: Response): void => {
  res.status(200).json({ success: true });
};

const exampleHandler = (_req: Request, res: Response): void => {
  res.status(200).json({ stuff: 'v3 example request' });
};

const deadHandler = (_req: Request, res: Response): void => {
  res.status(400).json({ stuff: 'v3 dead request (' + _req.method + ')' });
};

// const exampleHandler = (req: Request, res: Response, next: NextFunction) => {
//     //Throwing some error
//     next(new HttpException(400,'Bad Request'));
// };

export { rootHandler, isAliveHandler, exampleHandler, deadHandler };
