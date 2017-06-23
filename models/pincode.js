var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PincodeSchema = mongoose.Schema({
  pincode: {type: Number},
  address: {type: String}
});

const Pincode = module.exports = mongoose.model("Pincode", PincodeSchema);

module.exports.findByPincode = function (pincode, callback) {
  const query = {pincode: pincode};
  Pincode.findOne(query, callback);
}

module.exports.addPincode = function (newPincode, callback) {
      newPincode.save(callback);
}
