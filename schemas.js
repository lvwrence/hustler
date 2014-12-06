var mongoose = require('mongoose');

var Schema = mongoose.Schema;
  
// inventory item
var itemSchema = new Schema({
  id: {type: Number, unique: true, required: true},
  name: {type: String, required: true},
  appid: {type: Number, required: true},
  contextid: {type: Number, required: true},
  classid: {type: Number, required: true},
  instanceid: {type: Number, required: true},
  amount: {type: Number, required: true},
  marketable: {type: Boolean, required: true, index: true}
});
var Item = mongoose.model('Item', itemSchema);

// fake account
var accountSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  credit: {type: Number, required: true}
// cookies
});
var Account = mongoose.model('Account', accountSchema);

// need to link inventory items with accounts

exports.Item = Item;
exports.Account = Account;

// turn off in production
//animalSchema.set('autoIndex', false);
