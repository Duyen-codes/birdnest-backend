app.get("/api/drones", async (request, response) => {
	fetch("http://assignments.reaktor.com/birdnest/drones", {
		method: "GET",
	})
		.then((response) => {
			let resToText = response.text();

			return resToText;
		})
		.then((data) => {
			if (data) {
				console.log("inside if block");
				xml2js.parseString(data, { mergeAttrs: true }, async (err, result) => {
					const captureList = result.report.capture;

					captureList.map(async (capture) => {
						const captureToSave = new Capture({
							snapshotTimestamp: capture.snapshotTimestamp,

							drone: capture.drone.map((item) => {
								return {
									serialNumber: item.serialNumber[0],
									positionX: item.positionX[0],
									positionY: item.positionY[0],
								};
							}),
						});

						const savedCaptures = await captureToSave.save();
					});

					const dataToReturn = await Capture.find({});

					response.json(dataToReturn);
				});
			}

	
			});
		});
	console.log("in (req, res) block");
	
});
