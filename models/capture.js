const mongoose = require("mongoose");

const captureSchema = mongoose.Schema({
	createdAt: { type: Date, expires: "10m", required: true },
	snapshotTimestamp: Array,
	drone: [
		{
			serialNumber: Array,
			positionX: Array,
			positionY: Array,
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
