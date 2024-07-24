import { Hono } from "hono";
import { logger } from "hono/logger";
import userRouter from "./routes/userRoutes";
import mongoose from "mongoose";

const app = new Hono();
app.use("*", logger());
// const io = new Server(serve({ fetch: app.fetch, port: 3000 }));
const DB = process.env.DB!;
mongoose.connect(DB).then(() => {
  console.log("mongodb is connected");
});
app.route("/api/v1/users", userRouter);
// io.on("connection", (socket) => {
//   console.log(`socket connected: ${socket.id}`);

//   socket.on("message", (msg) => {
//     console.log(msg, "fuck 4");
//     io.emit("message", msg);
//   });

//   socket.on("disconnect", (reason) => {
//     console.log(`socket disconnected: ${socket.id} for ${reason}`);
//   });
// });
// io.listen(4000);
export default app;
