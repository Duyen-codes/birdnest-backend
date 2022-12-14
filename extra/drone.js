const mongoose = require("mongoose");

const schema = mongoose.Schema({
	serialNumber: Array,
	positionX: Array,
	positionY: Array,
	capture: {
		type: String,
		ref: "Capture",
	},
});

module.exports = mongoose.model("Drone", schema);
