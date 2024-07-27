import { User } from "../Models/userModel";
import { IC } from "../types";
import { delOne, getAll, getOne } from "./handelFactory";
import { HTTPException } from "hono/http-exception";
import { updateMyUserObject, updateUserObject } from "../validator";

const filterObj = (
  obj: {
    name?: string | undefined;
    avatar?: string | undefined;
  },
  ...allowedFields: string[]
): object => {
  const newObj = {};
  Object.keys(obj).forEach(
    // @ts-ignore
    (el) => allowedFields.includes(el) && (newObj[el] = obj[el])
  );
  return newObj;
};

export const updateMyUser = async (c: IC) => {
  // this will only work if the user is logged in
  try {
    // getting the user from request object
    const body = updateMyUserObject.parse(await c.req.json());
    // u can use this to filter out unwanted fields
    const filterReq = filterObj(body, "name", "avatar");

    const currentUser = await User.findByIdAndUpdate(
      // @ts-ignore
      c.req.user._id,
      filterReq,
      {
        new: true,
        runValidators: true
      }
    );

    return c.json(
      {
        status: "success",
        data: {
          user: currentUser
        }
      },
      201
    );
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};

export const DelMyUser = async (c: IC) => {
  // this will only work if the user is logged in
  try {
    // @ts-ignore getting the user from request object
    await User.findByIdAndUpdate(c.req.user._id, { active: false });
    return c.json(
      {
        status: "success",
        data: null
      },
      204
    );
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};
export const getMe = async (c: IC) => {
  // this will only work if the user is logged in
  try {
    // @ts-ignore getting the user from request object
    const user = await User.findById(c.req.user._id);
    if (!user) {
      throw { message: "user not found" };
    }
    return c.json(
      {
        status: "success",
        data: {
          user
        }
      },
      200
    );
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};
export const updateUser = async (c: IC) => {
  try {
    const docId: string = c.req.param("id")!;
    const body = updateUserObject.parse(await c.req.json());
    const user = await User.findByIdAndUpdate(docId, body, {
      new: true
    });
    if (!user) {
      throw { message: "no document found with this ID" };
    }
    return c.json({
      status: "success",
      data: {
        user
      }
    });
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};
export const getUsers = getAll(User);
export const getUser = getOne(User);
export const deleteUser = delOne(User);
