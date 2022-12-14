app.get("/api/drones", async (req, res) => {
	// console.log("start of req, res callback");
	let something = await axios
		.get("http://assignments.reaktor.com/birdnest/drones")
		.then((response) => {
			// console.log("response", response);
			let data = response.data;
			// console.log("data", data);
			xml2js.parseString(data, { mergeAttrs: true }, async (err, result) => {
				// console.log("result", result);
				const captureObject = result.report.capture[0];
				// console.log("captureObject", captureObject);

				const dronesToSave = captureObject.drone.map(async (item) => {
					const singleDrone = new Drone({
						capture: captureObject.snapshotTimestamp[0],
						serialNumber: item.serialNumber[0],
						positionX: item.positionX[0],
						positionY: item.positionY[0],
					});

					const oldDrones = await Drone.find({});

					// loop through drone collection and check if any above exists
					const foundDrones = await Drone.find({
						serialNumber: { $in: singleDrone.serialNumber[0] },
					});

					const deleted = await Drone.deleteMany({ serialNumber: foundDrones });

					const savedDrone = await singleDrone.save();

					return savedDrone;
				});

				Promise.all(dronesToSave).then((resolvedDronesToSave) => {
					const droneIdList = resolvedDronesToSave.map((drone) => drone._id);

					const captureToSave = new Capture({
						...captureObject,
						createdAt: captureObject.snapshotTimestamp[0],
						drone: droneIdList,
					});
					captureToSave.save();
				});

				const allCaptures = Capture.find({})
					.populate("drone")
					.exec(function (err, data) {
						if (err) {
							console.log(err);
						} else {
							res.json(data);
						}
					});
			});
		});
}); // end of route callback
