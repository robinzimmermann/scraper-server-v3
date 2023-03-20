import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../models/httpException.model';

const failSaveHandler = (
  error: HttpException,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('in failSaveHandler');
  res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message || 'Something went wrong',
  });
  next();
};

export { failSaveHandler };

// Response<unknown, Record<string, unknown>>
