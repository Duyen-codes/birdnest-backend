const mongoose = require("mongoose");

const captureSchema = mongoose.Schema({
	createdAt: { type: Date, expires: "10m", required: true },
	snapshotTimestamp: { type: Array, required: true },
	drone: [
		{
			serialNumber: { type: Array, required: true },
			positionX: { type: Array, required: true },
			positionY: { type: Array, required: true },
		},
	],
});

captureSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject._id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});
module.exports = mongoose.model("capture", captureSchema);
