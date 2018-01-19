//ITEM SCHEMA/MODEL
var mongoose = require("mongoose");

var itemSchema = new mongoose.Schema({
	name:String,
	price: Number,
	sale: Number,
	owner: String,
	image:[{
		type:String,
	}],
	description: String,
	created:{type:Date, default: new Date()},
	author: {
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String,
		name:String
	}
});

module.exports = mongoose.model("Item", itemSchema);

