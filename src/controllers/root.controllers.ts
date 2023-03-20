// console.log('loading src/controllers/api.controller.ts');
import { Request, Response } from 'express';

import { publicDir } from '../globals';

const rootDeadHandler = (_req: Request, res: Response): void => {
  // res.status(400).json({ stuff: 'root dead request (' + _req.method + ')' });
  res.sendFile(`${publicDir}/rest.html`);
};

export { rootDeadHandler };
