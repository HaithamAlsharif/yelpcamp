var express = require("express");
var router  = express.Router({mergeParams: true}); // the object that we passed is to merge the params from comments and campgrounds so we can use the "req.params.id" in the line i wrote "shit" in below
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware"); // we can use the file name because it automatically requires the "index.js"


router.get("/new", middleware.isLoggedIn, function(req,res){ // here we have the isLoggedIn middleware because only logged in users should be able to make comments
    // it is actually "/campgrounds/:id/comments/new"
    Campground.findById(req.params.id,function(err,foundCampground){  // shit
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground:foundCampground});
        }
    })
});

router.post("/",middleware.isLoggedIn ,function(req,res){ // for security we need this to have the middleware aswell, for example using postman would allow any user to make a comment.
    // it is actually "/campgrounds/:id/comments/"
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    // NEW SHIT
                    // add an id and username to that comment !! so there will be an username associated with every comment.
                    //console.log(req.user.username);
                    //console.log(comment.author);
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save(); // this fucked me up

                    //push it into the comment array for the user
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success","Successfully added your comment");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            })
        }
    })
});

// COMMENTS EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership ,function(req,res){
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            return res.redirect("back"); // check if the campground if valid and there ! if not then break this right here !
        }

        Comment.findById(req.params.comment_id,function(err,foundComment){ // if we get here then what we have is a valid campground. Added to fix the major crashin bug.
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit",{comment: foundComment,campgroundId: req.params.id});
            }
        });
    });
});

// COMMENTS UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership ,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

// COMMENT DELETE ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership ,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Successfully deleted the comment");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});





module.exports = router;