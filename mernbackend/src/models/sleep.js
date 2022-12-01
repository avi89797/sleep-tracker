const mongoose = require("mongoose");
const sleepSchema = mongoose.Schema(
  {
    sleepTime: {
      type: String,
      required: [true, "Please select a valid sleep time"],
    },
    wakeUpTime: {
      type: String,
      required: [true, "Please select a valid wake up time"],
    },
    date: {
      type: Date,
      required: [true, "The date is not valid"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Sleep = new mongoose.model("Sleep",sleepSchema);
module.export =Sleep;