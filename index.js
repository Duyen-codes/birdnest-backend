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

const MONGODB_URI =
	"mongodb+srv://birdNestApp:birdNestApp@cluster0.xdsqopm.mongodb.net/birdNestApp?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);
mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true })
	.then(() => {
		console.log("connected to", MONGODB_URI);
	})
	.catch((error) => {
		console.log("error connecting to MongoDB: ", error.message);
	});

app.get("/", (request, response) => {
	response.send("<h1>Hello world</h1>");
});

app.get("/api/drones", async (req, res) => {
	// console.log("start of req, res callback");
	let something = await axios
		.get("http://assignments.reaktor.com/birdnest/drones")
		.then((response) => {
			// console.log("response", response);
			let data = response.data;
			// console.log("data", data);
			xml2js.parseString(data, { mergeAttrs: true }, (err, result) => {
				// console.log("result", result);
				const captureArr = result.report.capture;
				// console.log("captureArr", captureArr);

				const mappedList = captureArr.map(async (capture) => {
					const captureObjToSave = new Capture({
						createdAt: capture.snapshotTimestamp,
						snapshotTimestamp: capture.snapshotTimestamp,

						drone: capture.drone.map((item) => {
							return {
								serialNumber: item.serialNumber[0],
								positionX: item.positionX[0],
								positionY: item.positionY[0],
							};
						}),
					});

					// filter duplicates drone item in capture object before saving to DB
					// get all data from database
					const dataDB = await Capture.find({});

					// loop through dataDB and remove drone object that has same item as in captureObjToSave.drone with captureObjToSave object's drone array property

					const result = dataDB.filter((captureObject) => {
						return captureObject.drone.filter(function (droneObject) {
							// console.log("drone", drone);
							return !captureObjToSave.drone.includes(droneObject);
							// return captureObjToSave.drone.some(function (item) {
							// 	// console.log("item", item);
							// 	// console.log("item serialNumber", item.serialNumber[0]);
							// 	// console.log(
							// 	// 	"captureObject drone serialNumber",
							// 	// 	captureObject.drone.serialNumber,
							// 	// );
							// 	console.log(item.serialNumber[0] === drone.serialNumber[0]);
							// 	return item.serialNumber[0] === drone.serialNumber[0];
							// });
						});
					});

					console.log("result.length", result.length);
					console.log("dataDB", dataDB.length);

					// console.log("captureObjToSave", captureObjToSave);
					const savedCapture = await captureObjToSave.save();
					console.log("savedCapture", savedCapture);

					const dataToReturn = await Capture.find({});
					// console.log("dataToReturn", dataToReturn);
					// console.log("dataToReturn length", dataToReturn.length);

					res.json({ dataToReturn, recentSavedCapture: savedCapture });
				});
				// console.log("after saving to db");
			});
		});

	// console.log("end of req, res callback");
});

app.get("/api/pilots/:serialNumber", (request, response) => {
	// console.log("request", request);
	// console.log("request.params", request.params.serialNumber);
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
			}
		})
		.catch((error) => {
			return error;
		});
});

// catch requests made to non-existent routes
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
