const mongoose = require("mongoose");

const captureSchema = new mongoose.Schema({
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
