const mongoose = require("mongoose");

const captureSchema = mongoose.Schema({
	createdAt: { type: Date, expires: "10m" },
	snapshotTimestamp: Array,
	drone: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Drone",
		},
	],
});

module.exports = mongoose.model("capture", captureSchema);
