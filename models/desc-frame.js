var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({}, { strict: false });

module.exports = mongoose.model('DescFrame', schema);