// any other routes and auth routes
var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user");

router.get("/",function(req,res){
    res.render("landing");
});


//////////////// AUTH ROUTES ///////////////

// show the register form route
router.get("/register",function(req,res){
    res.render("register");
});

// handle sign up logic
router.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser,req.body.password,function(err,newlyCreatedUser){ // hash the damn password
        if(err){
            req.flash("error",err.message); // this helpful err.message is coming from mongoose-passport-local thing
            return res.redirect("register");
        }

        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to YelpCamp " + newlyCreatedUser.username);
            res.redirect("/campgrounds"); // after we register the user please redirect them to this 
        });
    }); 

});

////// loging forms 

router.get("/login",function(req,res){ 
        res.render("login"); // here we use the flash so when we get redirected to this route (isLoggedIn failure) we would pass the message  
});

router.post("/login",passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
})
,function(req,res){}) // "WE LOG IN USING A MIDDLEWARE" >> app.post("/route", middleware , callback)

////// logout route

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged You Out");
    res.redirect("/campgrounds");
})

module.exports = router;
