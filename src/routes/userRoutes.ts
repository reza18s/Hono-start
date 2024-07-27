import { Hono } from "hono";
import {
  forgotPassword,
  protect,
  resetPassword,
  restrictTo,
  signin,
  signup,
  updatePassword
} from "../controllers/authController";
import {
  deleteUser,
  DelMyUser,
  getMe,
  getUser,
  getUsers,
  updateMyUser,
  updateUser
} from "../controllers/userController";
import { Role } from "../types";

const userRouter = new Hono();

userRouter.get("/", getUsers);
userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.patch("/update-password", protect, updatePassword);
userRouter.patch("/update-me", protect, updateMyUser);
userRouter.delete("/delete-me", protect, DelMyUser);
userRouter.get("/get-me", protect, getMe);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.patch("/resetpassword/:token", resetPassword);

userRouter
  .get("/:id", protect, restrictTo(Role.Admin), getUser)
  .patch("/:id", protect, restrictTo(Role.Admin), updateUser)
  .delete("/:id", protect, restrictTo(Role.Admin), deleteUser);

export default userRouter;
