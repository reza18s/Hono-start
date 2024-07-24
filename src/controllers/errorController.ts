import { Response, Request } from "express";
import { ErrorHandler } from "../util/ErrorHandler";
import { IError } from "../types";
import { Error } from "mongoose";

const handleCastErrorDB = (err: IError) => {
   const message = `Invalid ${err.path}: ${err.value}.`;
   return new ErrorHandler(message, 400);
};

const handleDuplicateFieldsDB = (err: IError) => {
   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
   console.log(value);

   const message = `Duplicate field value: ${value}. Please use another value!`;
   return new ErrorHandler(message, 400);
};
const handleValidationErrorDB = (err: IError) => {
   const errors = Object.values(err.errors).map((el: Error) => el.message);

   const message = `Invalid input data. ${errors.join(". ")}`;
   return new ErrorHandler(message, 400);
};

const sendErrorDev = (err: IError, res: Response) => {
   res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
   });
};

const sendErrorProd = (err: IError, res: Response) => {
   if (err.isOperational) {
      res.status(err.statusCode).json({
         status: err.status,
         message: err.message,
      });
   } else {
      res.status(500).json({
         status: "error",
         message: "Something went very wrong!",
      });
   }
};

export const globalErrorHandler = (
   err: IError,
   req: Request,
   res: Response,
   next: NewableFunction,
) => {
   err.statusCode = err.statusCode || 500;
   err.status = err.status || "error";
   if (process.env.NODE_ENV === "development") {
      sendErrorDev(err, res);
   } else if (process.env.NODE_ENV === "production") {
      let error = err;
      if (error.name === "CastError") {
         error = handleCastErrorDB(error);
      }
      // if (error.name === 'MongoError' && error.code === 11000)
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === "ValidationError")
         error = handleValidationErrorDB(error);
      sendErrorProd(error, res);
   }
};
