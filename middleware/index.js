// all the middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){ // check if logged in .. just like the middleware but different approach

        Campground.findById(req.params.id,function(err,foundCampground){ 
            if(err || !foundCampground){
                req.flash("error","Campground not found!"); // not often 
                res.redirect("back") // middleware thing: IT SENDS THE USER BACK WHERE THEY CAME FROM !! :O
            }else{
                //console.log(req.user._id);
                //console.log(foundCampground.author.id);
                if(foundCampground.author.id.equals(req.user.id)){ // only allow the user that made the damn post 
                    next();
                }else{
                    req.flash("error","You are not authorized!"); // not often 
                    res.redirect("back");
                };
            };
        });

    }else{
        req.flash("error","You need to be logged in to do that"); // not often
        res.redirect("back"); 
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user.id)){
                    next();
                }else{
                    req.flash("error","You are not authorized!");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    req.flash("error","You need to be logged in to do that !"); // the flash shows up on the next page (res.redirect("/login")), thats why we have to flash before redirect !
    res.redirect("/login"); // the one in the index router.. go there
};

module.exports = middlewareObj;