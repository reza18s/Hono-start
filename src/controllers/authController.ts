import { User } from "../Models/userModel";
import { IC, IUserDocument, Role } from "../types";
import { sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { getCookie, setCookie } from "hono/cookie";
import {
  forgotPasswordObject,
  resetPasswordObject,
  signinObject,
  signupObject,
  updatePasswordObject
} from "../validator";
import { Next } from "hono";
import { CryptoHasher } from "bun";
import { StatusCode } from "hono/utils/http-status";
export const createToken = async (
  c: IC,
  user: IUserDocument,
  statusCode: StatusCode = 200
) => {
  try {
    const payload = {
      id: user._id,
      sub: "user123",
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // Token expires in 60 minutes
    };
    const secret = process.env.JWT_SECRET!;
    const token = await sign(payload, secret);
    setCookie(c, "jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "development" ? false : true,
      expires: new Date(
        Date.now() + +process.env.COOKIES_EXPIRES! * 24 * 60 * 60 * 1000
      )
    });
    return c.json(
      {
        status: "success",
        token,
        data: {
          user
        }
      },
      statusCode
    );
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};

export const signup = async (c: IC) => {
  try {
    const body = signupObject.parse(await c.req.json());
    const user: IUserDocument = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      passwordChangedAt: Date.now()
    });
    return createToken(c, user, 201);
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};

export const signin = async (c: IC) => {
  try {
    const { email, password } = signinObject.parse(await c.req.json());
    const user = await User.findOne({ email }).select("+password");
    //create Express Password Checker
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw { message: "incorrect email/password" };
    }
    return createToken(c, user);
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};

export const protect = async (c: IC, next: Next) => {
  try {
    let token: string | undefined;
    if (
      c.req.header("authorization") &&
      c.req.header("authorization")?.startsWith("Bearer")
    ) {
      token = c.req.header("authorization")?.split(" ")[1];
    } else {
      token = getCookie(c, "jwt");
    }
    if (!token) {
      throw { message: "token does ot exist" };
    }
    const decoded = await verify(token, process.env.JWT_SECRET!);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      throw { message: "user does not exist anymore" };
    }

    if (currentUser.changedPasswordAfter(decoded.iat!)) {
      throw { message: "User recently changed password! Please log in again." };
    }
    // @ts-ignore
    c.req["user"] = currentUser;
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      res: c.json({
        error
      })
    });
  }
};

export const restrictTo = (...role: Role[]) => {
  return async (c: IC, next: Next) => {
    // @ts-ignore
    if (!role.includes(c.req.user.role)) {
      throw new HTTPException(403, {
        res: c.json({
          message: "you don't have permission to preform this action"
        })
      });
    }
    await next();
  };
};
export const forgotPassword = async (c: IC) => {
  try {
    const body = forgotPasswordObject.parse(await c.req.json());
    const currentUser = await User.findOne({ email: body.email });
    if (!currentUser) {
      throw { message: "There is no user with that email address." };
    }

    const resetToken = currentUser.createPasswordRestToken();
    await currentUser.save();

    const resetURL = `${process.env.PUBLIC_URL}/api/v1/users/resetpassword/${resetToken}`;
    try {
      return c.json({
        status: "success",
        message: "Token sent to email!"
      });
    } catch (error) {
      // @ts-ignore
      currentUser.passwordRestToken = undefined;
      // @ts-ignore
      currentUser.passwordRestExpires = undefined;
      await currentUser.save();
      throw error;
    }
  } catch (error) {
    throw new HTTPException(500, {
      res: c.json({
        error
      })
    });
  }
};
export const resetPassword = async (c: IC) => {
  try {
    const body = resetPasswordObject.parse(await c.req.json());
    const token = c.req.param("token");
    const tokenHash = new CryptoHasher("sha256") // @ts-ignore
      .update(token)
      .digest("hex");
    const currentUser = await User.findOne({
      passwordRestToken: tokenHash,
      passwordRestExpires: { $gt: Date.now() }
    });

    if (!currentUser) {
      throw "Token is invalid or has expired";
    }
    currentUser.password = body.password;
    currentUser.passwordConfirm = body.passwordConfirm;
    // @ts-ignore
    currentUser.passwordRestToken = undefined;
    // @ts-ignore
    currentUser.passwordRestExpires = undefined;
    await currentUser.save();

    return createToken(c, currentUser);
  } catch (error) {
    throw new HTTPException(401, {
      res: c.json({ error: error })
    });
  }
};

export const updatePassword = async (c: IC) => {
  try {
    const body = updatePasswordObject.parse(await c.req.json());
    if (body.newPassword === body.password) {
      throw { message: "new password can't be same as old" };
    }
    // @ts-ignore
    const currentUser = await User.findById(c.req.user.id).select("+password");
    if (
      !currentUser ||
      !currentUser.password ||
      !(await currentUser.correctPassword(body.password, currentUser.password))
    ) {
      throw { message: "incorrect email/password" };
    }
    currentUser.password = body.newPassword;
    currentUser.passwordConfirm = body.newPasswordConfirm;
    await currentUser.save();
    return createToken(c, currentUser);
  } catch (error) {
    throw new HTTPException(401, {
      res: c.json({ error: error })
    });
  }
};
