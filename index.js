require("dotenv").config();

const express = require("express");
const xml2js = require("xml2js");
const fetch = require("node-fetch");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const Capture = require("./models/capture");

const app = express();

// const requestLogger = (request, response, next) => {
// 	console.log("Method:", request.method);
// 	console.log("Path:  ", request.path);
// 	console.log("Body:  ", request.body);
// 	console.log("---");
// 	next();
// };
// app.use(requestLogger);
app.use(cors());
app.use(express.static("build"));
const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", true);
mongoose
	.connect(url, { useNewUrlParser: true })
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB: ", error.message);
	});

app.get("/", (request, response) => {
	response.send("<h1>Hello world</h1>");
});

app.get("/api/drones", async (req, res) => {
	let something = await axios
		.get("http://assignments.reaktor.com/birdnest/drones")
		.then((response) => {
			let data = response.data;

			xml2js.parseString(data, { mergeAttrs: true }, async (err, result) => {
				const captureObject = result.report.capture[0];
				// console.log("captureObject", captureObject);

				const captureObjToSave = new Capture({
					createdAt: captureObject.snapshotTimestamp,
					snapshotTimestamp: captureObject.snapshotTimestamp,
					drone: captureObject.drone.map((item) => {
						return {
							serialNumber: item.serialNumber[0],
							positionX: item.positionX[0],
							positionY: item.positionY[0],
						};
					}),
				});

				const savedCapture = await captureObjToSave.save();

				const dataToReturn = await Capture.find({});

				res.json({ captures: dataToReturn, recentSavedCapture: savedCapture });
			});
		});
}); // end of route callback

app.get("/api/pilots/:serialNumber", (request, response, next) => {
	const serialNumber = request.params.serialNumber;
	// console.log("serialNumber", serialNumber);

	fetch(`http://assignments.reaktor.com/birdnest/pilots/${serialNumber}`)
		.then((response) => {
			// console.log("response", response);
			// console.log("response.body", response.body);
			return response.json();
		})
		.then((data) => {
			if (data) {
				// console.log("data", data);
				response.json(data);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => {
			console.log(error);
			// response.status(400).send({ error: "malformatted serialNumber" });
			next(error);
		});
});

const errorHandler = (error, request, response, next) => {
	console.error(error.message);
	if (error.name === "FetchError") {
		return response.status(400).end({ error: "malformatted serialNumber" });
	}
	next(error);
};
// catch requests made to non-existent routes
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// handler of requests with result to errors
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
