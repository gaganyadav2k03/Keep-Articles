import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/customError'

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  res.status(statusCode).json({ message });
};