require("dotenv").config();
require("./lib/cron/updateDietStatus.js");
require("./lib/cron/updateSubscriptionPlan.js");
const express = require("express");
const http = require("http");
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToMongoDB = require("./db/connect.js");

const errorController = require("./controllers/error.controller.js");
const AppError = require("./util/appError.js");
const setupSwagger = require("./swagger");
const webhookFunction = require("./util/webhook.js");
const setupSocket = require("./config/socket.js");
const limiter = require("./middlewares/rateLimiter.js");
const corsMiddleware = require('./config/cors.js');


const port = process.env.PORT || 5000;
const mongoURL = process.env.MONGODB_URL;

const app = express();
const httpServer = http.createServer(app);

// Use CORS with the specified options
app.use(corsMiddleware);

app.post("/webhook", express.raw({ type: "application/json" }), webhookFunction);


app.use(express.json());
app.use(cookieParser());


app.set('trust proxy', 1);
app.set("views", "./views");
app.set("view engine", "ejs");

app.options("*", corsMiddleware);


if (process.env.NODE_ENV !== "development") {
  app.use("/api", limiter);
}



// app.use("/webhook", express.raw({ type: "application/json" }));

setupSwagger(app);
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("This is the base project");
});

// Non-implemented routes middleware
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can’t find ${req.originalUrl} with ${req.method} method on this server`,
      501
    )
  );
});

app.use(errorController);

setupSocket(httpServer)

httpServer.listen(port, async () => {
  console.log(`Server running on ${port}`);
  await connectToMongoDB(mongoURL);
});
