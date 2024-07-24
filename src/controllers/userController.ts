import { Response, NextFunction } from "express";
import { User } from "../Models/userModel";
import { catchAsync } from "../util/catchAsync";
import { ErrorHandler } from "../util/ErrorHandler";
import { IRequest } from "../types";
import { delOne, getAll, getOne, updateOne } from "./handelFactory";

const filterObj = (obj, ...allowedFields: string[]): object => {
  const newObj = {};
  Object.keys(obj).forEach(
    (el) => allowedFields.includes(el) && (newObj[el] = obj[el])
  );
  return newObj;
};

export const updateMyUser = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new ErrorHandler(
          "This route is not for password updates. Please use /updateMyPassword.",
          400
        )
      );
    }
    const filterReq = filterObj(req.body, "name", "email");

    const currentUser = await User.findByIdAndUpdate(req.user._id, filterReq, {
      new: true,
      runValidators: true
    });

    res.status(201).json({
      status: "success",
      data: {
        user: currentUser
      }
    });
  }
);

export const DelMyUser = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
      status: "success",
      data: {
        user: null
      }
    });
  }
);
export const getMe = (c) => {
  req.params.id = req.user.id;
  next();
};
export const getUsers = getAll(User);

export const getUser = getOne(User);
export const updateUser = updateOne(User);
export const deleteUser = delOne(User);
