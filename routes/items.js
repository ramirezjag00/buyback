var express = require("express");
var router = express.Router();
var Item = require("../models/item");
var middleware = require("../middleware");
var multer = require("multer");
var path = require("path");

//Set Storage Engine
var storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, callback) {
    callback(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//Init Upload
var upload = multer({
	storage: storage,
	limits:{fileSize: 1000000},
	fileFilter: function(req,file,callback){
		checkFileType(file, callback);
	}
});

// Check File Type
function checkFileType(file, callback){
  // Allowed ext
  var filetypes = /jpeg|jpg|png/;
  // Check ext
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  var mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return callback(null,true);
  } else {
    callback('Error: Images Only!');
  }
};

//INDEX ROUTE
router.get("/", function(req,res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Item.find({name: regex}, function(err, allItems){
            if(err){
                console.log(err);
            } else {
                if(allItems.length === 0){
                    noMatch = "'"+req.query.search+"'"+ " did not match items";
                }
                res.render("items/index", {items:allItems, page:"items", noMatch:noMatch});
            }         
        });
    } else {
        Item.find({}, function(err, allItems){
            if(err){
                console.log(err);
            } else {
                res.render("items/index", {items:allItems, page:"items", noMatch:noMatch});
            }
        });
    }
});

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, upload.array("image", 4), function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var sale = req.body.sale;
	var owner = "";
	var image = [];
	for(var i = 0; i < req.files.length; i++){
		image.push(req.files[i].filename);
	};
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username,
		name: req.user.name
	}
	var newItem = {name: name, price:price, sale:sale, owner : owner, image: image, description:desc, author:author}
	//create a new item and save to DB
	Item.create(newItem, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/items");
		}
	});
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("items/new");
});

//SHOW - RESTFUL ROUTE
router.get("/:id", function(req,res){
	//find the Item with the provided ID
	Item.findById(req.params.id, function(err,foundItem){
		if(err){
			res.redirect("items/index");
		} else {
			//render show template with that item
			res.render("items/show", {item: foundItem, itemImage: foundItem.image});
		}
	});
});


//update owner Route
router.put("/:id", middleware.isLoggedIn, function(req,res){
	Item.findByIdAndUpdate(req.params.id, {$set:{owner: req.user.id}}, function(err, updatedItem){
			if(err){
			console.log(err);
		} else {
			req.flash("success", "You successfully bought an item for sale! Please contact MIS Hotline.");
			res.redirect("/items/" + req.params.id);
		}
	});
});

//DESTROY ROUTE
router.delete("/:id", middleware.isLoggedIn, function(req,res){
	Item.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/items");
		} else {
			req.flash("success", "Item deleted!");
			res.redirect("/items");
		}
	});
});

//def for search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;