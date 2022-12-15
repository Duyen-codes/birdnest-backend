const config = require("./utils/config");

const express = require("express");
const app = express();
const cors = require("cors");

const captureRouter = require("./controllers/captures");
const pilotRouter = require("./controllers/pilot");

const logger = require("./utils/logger");
const mongoose = require("mongoose");
const middleware = require("./utils/middleware");

const url = config.MONGODB_URI;

logger.info("connecting to", url);
mongoose.set("strictQuery", true);
mongoose
	.connect(url, { useNewUrlParser: true })
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB: ", error.message);
	});

app.use(cors());
app.use(express.static("build"));
app.use(middleware.requestLogger);

app.use("/api/drones", captureRouter);
app.use("/api/pilots", pilotRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
