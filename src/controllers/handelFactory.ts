import { NextFunction, Request, Response } from "express";
import { IRequest, IUserDocument, IModel } from "../types";
import { catchAsync } from "../util/catchAsync";
import { ErrorHandler } from "../util/ErrorHandler";
import { ApiFeatures } from "../util/ApiFeature";

export const getAll = (model: IModel) =>
   catchAsync(async (req: Request, res: Response) => {
      let filter: object = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };
      const feature = new ApiFeatures(model.find(filter), req.query)
         .filter()
         .sort()
         .fields()
         .pagination();
      const doc = await feature.query;
      res.status(200).json({
         status: "success",
         results: doc.length,
         data: {
            doc,
         },
      });
   });

export const getOne = (model: IModel, popOption?) =>
   catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      let query;
      if (popOption) {
         query = model.findById(req.params.id).populate(popOption);
      } else {
         query = model.findById(req.params.id);
      }
      const doc = await query;

      if (!doc) {
         return next(new ErrorHandler("no document found with this ID", 404));
      }
      res.status(200).json({
         status: "success",
         data: {
            doc,
         },
      });
   });
export const createOne = (model: IModel) =>
   catchAsync(async (req: Request, res: Response) => {
      const doc: IUserDocument = await model.create(req.body);
      res.status(201).json({
         status: "success",
         data: {
            doc,
         },
      });
   });
export const updateOne = (model: IModel) =>
   catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
      const docId: string = req.params.id;
      const doc = await model.findByIdAndUpdate(docId, req.body, {
         new: true,
      });
      if (!doc) {
         return next(new ErrorHandler("no document found with this ID", 404));
      }
      res.status(201).json({
         status: "success",

         data: {
            doc,
         },
      });
   });
export const delOne = (model: IModel) =>
   catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
      const docID: string = req.params.id;
      await model.findByIdAndDelete(docID);

      res.status(201).json({
         status: "success",
         data: null,
      });
   });
