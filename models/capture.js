const mongoose = require("mongoose");

const captureSchema = mongoose.Schema({
	createdAt: { type: Date, expires: "10m" },
	snapshotTimestamp: Array,
	drone: [
		{
			serialNumber: Array,
			positionX: Array,
			positionY: Array,
		},
	],
});

module.exports = mongoose.model("capture", captureSchema);
