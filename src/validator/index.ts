import { z } from "zod";

export const signupObject = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      ),
    passwordConfirm: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      )
  })
  .strict();
export const signinObject = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      )
  })
  .strict();
export const forgotPasswordObject = z
  .object({
    email: z.string().email()
  })
  .strict();
export const updatePasswordObject = z
  .object({
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      ),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      ),
    newPasswordConfirm: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      )
  })
  .strict();
export const resetPasswordObject = z
  .object({
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      ),
    passwordConfirm: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
      )
  })
  .strict();
export const updateMyUserObject = z
  .object({
    name: z.string().min(4, "Please enter a valid value").optional(),
    avatar: z.string().url("please enter a url").optional()
  })
  .strict();
export const updateUserObject = z
  .object({
    name: z.string().min(4, "Please enter a valid value").optional(),
    role: z.enum(["user", "admin"]).optional(),
    avatar: z.string().url("please enter a url").optional()
  })
  .strict();
