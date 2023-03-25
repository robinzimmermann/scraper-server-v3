import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../../models/httpException.model';

// const exampleHandler = (_req: Request, res: Response): void => {
//   res.status(200).send('v2 example request');
// };

const v2Handler = (_req: Request, _res: Response, next: NextFunction): void => {
  //Throwing some error
  next(new HttpException(400, 'the v2 api is old, baby'));
};

// const exampleHandler = (_req: Request, _res: Response, next: NextFunction) => {
//Throwing some error
// console.log('in exampleHandler');
// next(new HttpException(400, 'Bad Request poopy v2'));
// };

export { v2Handler };
