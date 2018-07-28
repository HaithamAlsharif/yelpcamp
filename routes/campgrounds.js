var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); // we can use the file name because it automatically requires the "index.js"

// google maps, node-geocoder setup
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, // here we put apikey BUT we want to hide this! so we made the .env file and downloaded the "dotenv" to use this format and hide it !
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// FILLING IN THE CAMPGROUNDS FROM THE DB
// RESTFUL - INDEX
router.get("/",function(req,res){           // it is actually "/campgrounds"
    //console.log(req.user); // req.user gives us the information about the logged in user . "undefined" means not logged in user
    Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    })
});

// RESTFUL - CREATE
// router.post("/",middleware.isLoggedIn,function(req,res){          // it is actually "/campgrounds"
//     var name = req.body.name; // body parser is helping here
//     var price = req.body.price;
//     var image = req.body.image;
//     var description = req.body.description;
//     var author = {id: req.user._id, username: req.user.username};
//     var newCampObj = {name: name,price: price,image: image,description: description, author: author};
    
//     Campground.create(newCampObj,function(err,newCreatedCampObj){
//         if(err){
//             console.log(err);
//         }else{
//             // newCampObj.author.id = req.user.id; // the cleaner way is to make an author object like we did above and then add it to newCampObj
//             // newCampObj.author.username = req.user.username;
//             res.redirect("/campgrounds");
//         }
//     }) 
// });

//CREATE - add new campground to DB - THIS IS A NEW ONE CUZ OF THE MAP
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) { // req.bod.location = Riyadh, Saudi Arabia.. for example
      if (err || !data.length) {
        req.flash('error', 'Invalid Adress');
        return res.redirect('back');
      }
      // here we added the properties

      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCampground = {name: name, price:price ,image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      Campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
              res.redirect("/campgrounds");
          }
      });
    });
  });

// RESTFUL - NEW
router.get("/new",middleware.isLoggedIn, function(req,res){        // it is actually "/campgrounds/new"
    res.render("campgrounds/new");
});

// // RESTFUL - SHOW (showing more info of one item)
router.get("/:id",function(req,res){        // it is actually "/campgrounds/:id"
    // to get the id from the link (:id) : req.params.id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){ // we say that the foundCampground has commments so please "populate the comments" with the the proper data
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            req.redirect("back");
        }else{
            res.render("campgrounds/show",{campground: foundCampground});
        }
    })

});

// EDIT CAMPGROUND ROUTE <<< here is the form that we need to submit stuff on. and it will be submitted to the "UPDATE" route
// the logic process is as the following:
    //Is user logged in?
        // does user own the campground ?
        // otherwise, redirect
    // if not then redirect


router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){ 
        Campground.findById(req.params.id,function(err,foundCampground){ // the error is handled in the middleware too
                //console.log(req.user._id);
                //console.log(foundCampground.author.id);
                res.render("campgrounds/edit",{campground:foundCampground}); // the folder path is like this
        });
});

// // UPDATE CAMPGROUND ROUTE <<< we are submitting to this

// router.put("/:id/",middleware.checkCampgroundOwnership,function(req,res){
//     // find and upadate the correct campground
//     // the second parameter below needs to be the data that we need to change, and since we have them wrapped in campground[], then we use campground
//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
//         if(err){
//             res.redirect("/campgrounds");
//         }else{
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     })
//     // redirect somewhere (show page)
// });

// UPDATE CAMPGROUND ROUTE - THIS IS A NEW ONE CUZ OF THE MAP
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.campground.location, function (err, data) { // req.body.campground.location is whatever we provided in the text field
      if (err || !data.length) {
        // console.log(err);
        req.flash('error', 'Sorry, Invalid address update please try again.');
        return res.redirect('back');
      }

      // here we added the properties to the campground in a different way than making a new campground in POST
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
    });
  });

// DESTROY CAMPGROUND ROUTE

router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;
