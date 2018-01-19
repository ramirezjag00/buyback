//all the middleware goes here
var Item = require("../models/item");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

module.exports = middlewareObj;
