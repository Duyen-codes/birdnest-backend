const pilotRouter = require("express").Router();
const fetch = require("node-fetch");

pilotRouter.get("/:serialNumber", (request, response, next) => {
	const serialNumber = request.params.serialNumber;

	fetch(`http://assignments.reaktor.com/birdnest/pilots/${serialNumber}`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data) {
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

module.exports = pilotRouter;
