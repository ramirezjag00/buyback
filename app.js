//SET UP
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
	//passport - to authenticate with username/password
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Item = require("./models/item");
var User = require("./models/user");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var multer = require("multer");
var path = require("path");
// var seedDB = require("./seeds");

//requiring routes
var itemRoutes = require("./routes/items");
var indexRoutes = require("./routes/index");

//APP CONFIG
mongoose.connect("mongodb://localhost/buybackv1", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
//seedDB(); //seed the database
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIG
app.use(require("express-session")({
	secret:"fpvpavargrrafriraglfvk",
	resave:false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//ROUTES APP CONFIG
app.use("/", indexRoutes);
app.use("/items", itemRoutes);

app.get("*", function(req, res) {
    res.send("You are trying to access a page that does not exist.");
});

//SERVER
app.listen(3000 | process.env.PORT, process.env.IP, function(){
	console.log("BUYBACK SERVER STARTED");
});

//app.listen(27017);
