const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressfield: [
    {
      fullName: {
        type: String,
        required: true,
      },
      mobile_no: {
        type: String,
        required: true,
      },
      address1: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      PINcode: {
        type: String,
        required: true,
      },
    },
  ],
});

const address = mongoose.model("Address", addressSchema);

module.exports = {
  address,
};
