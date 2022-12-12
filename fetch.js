app.get("/api/drones", async (request, response) => {
	fetch("http://assignments.reaktor.com/birdnest/drones", {
		method: "GET",
	})
		.then((response) => {
			// console.log("response", response);
			let resToText = response.text();
			// console.log("resToText", resToText);
			return resToText;
		})
		.then((data) => {
			// console.log("data", data);
			if (data) {
				console.log("inside if block");
				xml2js.parseString(data, { mergeAttrs: true }, async (err, result) => {
					// console.log("data", data);
					// console.log("result", result);

					// // `result` is a JavaScript object
					// // convert it to a JSON string using JSON.stringify() method
					// const json = JSON.stringify(result, null, 4);

					// // console.log("json", json);
					// const parsedJson = JSON.parse(json);

					// console.log("parsedJson", parsedJson);
					// console.log("result.capture", result.report.capture);
					const captureList = result.report.capture;

					// console.log("captureList", captureList);
					const mappedList = captureList.map(async (capture) => {
						console.log("before saving capture");
						const captureToSave = new Capture({
							snapshotTimestamp: capture.snapshotTimestamp,

							drone: capture.drone.map((item) => {
								// console.log("item", item);
								// console.log("item.serialNumber[0]", item.serialNumber[0]);
								return {
									serialNumber: item.serialNumber[0],
									positionX: item.positionX[0],
									positionY: item.positionY[0],
								};
							}),
						});
						// console.log("captureToSave", captureToSave);
						const savedCaptures = await captureToSave.save();
						// console.log("savedCaptures", savedCaptures);
					});
					console.log("after saving to db");

					const dataToReturn = await Capture.find({});
					console.log("dataToReturn", dataToReturn);
					console.log("dataToReturn length", dataToReturn.length);
					response.json(dataToReturn);
				});
				console.log("end of if block");
				// const promise = Capture.find({});
				// const result = promise.then((dataToReturnIF) => {
				// 	console.log("dataToReturnIF", dataToReturnIF);
				// 	console.log("dataToReturnIF length", dataToReturnIF.length);
				// 	// response.json(dataToReturn);
				// });
				//     .then(() => {
				// 	console.log("dataToReturn", dataToReturn);
				// 	response.json(dataToReturn);
				// });
			}

			const promiseThen = Capture.find({});
			const result = promiseThen.then((dataToReturnThen) => {
				console.log("dataToReturnThen", dataToReturnThen);
				console.log("dataToReturnThen length", dataToReturnThen.length);
				// response.json(dataToReturnThen);
			});
		});
	console.log("in (req, res) block");
	// const dataToReturnOuter = await Capture.find({});

	// console.log("dataToReturnOuter", dataToReturnOuter);
	// console.log("dataToReturnOuter length", dataToReturnOuter.length);
	// response.json(dataToReturn);
});
