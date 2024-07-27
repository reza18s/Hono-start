import { Schema, model } from "mongoose";
import { randomBytes } from "crypto";
import { IModel, IUserDocument, Role } from "../types";
import { CryptoHasher } from "bun";
export const userSchema = new Schema<IUserDocument>({
  name: { type: String, required: [true, "name is required!"] },

  password: {
    type: String,
    required: [true, "password is required!"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
      "Your password should have at minimum eight and maximum 16 characters, at least one uppercase letter, one lowercase letter, one number and one special character"
    ],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],

    validate: {
      validator: function (el: string) {
        return el === this.password;
      },
      message: "Passwords are not the same!"
    },
    select: false
  },
  email: {
    type: String,
    required: [true, "email is required!"],
    lowercase: true,
    unique: true,
    match: [/^([\w])+(@)+([\w])+(\.)+([a-z]{1,4})$/, "Your email is invalid"]
  },
  avatar: String,
  passwordChangedAt: Date,
  passwordRestToken: String,
  passwordRestExpires: Date,
  role: {
    type: String,
    enum: [Role.Admin, Role.Guide, Role.LeadGuide, Role.User],
    default: Role.User
  },
  active: { type: Boolean, default: true, select: false }
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await Bun.password.hash(this.password);
  // @ts-ignore
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = new Date().toISOString();
  next();
});
userSchema.pre(/^find/, function (this: IModel, next) {
  this.find();
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await Bun.password.verify(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWT: number): boolean {
  if (this.passwordChangedAt) {
    const ChangeTimes = this.passwordChangedAt.getTime() / 1000;
    return JWT < ChangeTimes;
  }
  return false;
};

userSchema.methods.createPasswordRestToken = function () {
  const restToken = randomBytes(32).toString("hex");
  this.passwordRestToken = new CryptoHasher("sha256")
    .update(restToken)
    .digest("hex");
  this.passwordRestExpires = Date.now() + 10 * 60 * 1000;
  return restToken;
};

export const User = model<IUserDocument>("User", userSchema);
