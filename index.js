const express = require("express");
const xml2js = require("xml2js");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

const requestLogger = (request, response, next) => {
	console.log("Method:", request.method);
	console.log("Path:  ", request.path);
	console.log("Body:  ", request.body);
	console.log("---");
	next();
};
app.use(requestLogger);
app.use(cors());

app.get("/", (request, response) => {
	response.send("<h1>Hello world</h1>");
});

app.get("/api/drones", (request, response) => {
	fetch("http://assignments.reaktor.com/birdnest/drones", {
		method: "GET",
	})
		.then((response) => {
			console.log("response", response);
			let resToText = response.text();
			console.log("resToText", resToText);
			return resToText;
		})
		.then((data) => {
			console.log("data", data);
			if (data) {
				xml2js.parseString(data, { mergeAttrs: true }, (err, result) => {
					console.log("result", result);

					// `result` is a JavaScript object
					// convert it to a JSON string using JSON.stringify() method
					const json = JSON.stringify(result, null, 4);
					const parsedJson = JSON.parse(json);
					// console.log("parsedJson", parsedJson);

					response.json(parsedJson);
				});
			}
		});
});

app.get("/api/pilots/:serialNumber", (request, response) => {
	console.log("request", request);
	console.log("request.params", request.params.serialNumber);
	const serialNumber = request.params.serialNumber;
	console.log("serialNumber", serialNumber);

	fetch(`http://assignments.reaktor.com/birdnest/pilots/${serialNumber}`)
		.then((response) => {
			console.log("response", response);
			console.log("response.body", response.body);
			return response.json();
		})
		.then((data) => {
			if (data) {
				console.log("data", data);

				response.json(data);
			}
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
