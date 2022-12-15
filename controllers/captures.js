const captureRouter = require("express").Router();
const Capture = require("../models/capture");
const axios = require("axios");
const xml2js = require("xml2js");

captureRouter.get("/", async (req, res, next) => {
	let something = await axios
		.get("http://assignments.reaktor.com/birdnest/drones")
		.then((response) => {
			let data = response.data;

			xml2js.parseString(data, { mergeAttrs: true }, async (err, result) => {
				const captureObject = result.report.capture[0];

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
		})
		.catch((error) => next(error));
}); // end of route callback
module.exports = captureRouter;
