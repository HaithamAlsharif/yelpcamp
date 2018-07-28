require('dotenv').config();

var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"), // (Campground) is going to allow us use Campground.create .save .find ... mongoose
    Comment    = require("./models/comment"),
    User       = require("./models/user"),
    seedDB     = require("./seeds"),
    flash      = require("connect-flash"), // must be before passport
    passport   = require("passport"),
    LocalStrategy = require("passport-local");
    

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");




// APP SETUP
mongoose.connect("mongodb://Haitham:hny0563771801@ds257551.mlab.com:57551/rentacamp"); //connecting to mLab
//mongoose.connect("mongodb://localhost/yelp_camp"); // THIS IS THE CREATION OF THE MONGO "COLLECTION"
app.set("view engine","ejs");   
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); // conventional
app.use(flash());
// seedDB();

// Moment js
app.locals.moment = require("moment"); // Now moment is available for use in all of your view files via the variable named moment

// passport configuration
app.use(require("express-session")({
    secret: "This is the secret.. boo",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); // here we are giving the strategy needed for authentication "User.authenticate()" comes from the local-passport-mongoose in the user.js
passport.serializeUser(User.serializeUser()); // sams idea from the line above
passport.deserializeUser(User.deserializeUser()); // sams idea from the line above


// Defining a middleware to ALL ROUTES so we can ALWAYS pass in the current user !

app.use( // app.use will make this middleware available on every route
    function(req, res, next){
        res.locals.currentUser = req.user; // res.locals.xxx means we are passsing this xxx to everypage and it will equal "= yyy"
        // res.locals.message = req.flash("error");
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next(); // here we say just move on to the next code right after sending the user.
});

// we use the routes after using everything above 
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes); // append "/campgrounds" in the beginning of EVERY route in that file !
app.use("/",indexRoutes);


app.listen(process.env.PORT || 3000,function(){
    console.log("RentACamp is running.");
});