// console.log('loading src/controllers/api.controller.ts');
import { Request, Response } from 'express';

import * as v1Controllers from './v1/controller';
import * as v2Controllers from './v2/controller';
import * as v3Controllers from './v3/controller';

const apiDeadHandler = (_req: Request, res: Response): void => {
  res.status(400).json({ stuff: 'api dead request (' + _req.method + ')' });
};

export { v1Controllers, v2Controllers, v3Controllers, apiDeadHandler };
