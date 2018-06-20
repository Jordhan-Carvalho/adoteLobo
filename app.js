// NPM PACKAGES
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Animal      = require("./models/animal"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");
    
// Chamar as routes
var commentRoutes    = require("./routes/comments"),
    adoteRoutes = require("./routes/adote"),
    indexRoutes      = require("./routes/index");


// USE  CONFIGURATIONS
// mongoose.connect("mongodb://localhost/animais");
mongoose.connect("mongodb://jordhan:jopc12anos@ds163530.mlab.com:63530/adote");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed db


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// middleware que vai adicionar current user em todas routes
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// USE ROUTES
app.use(indexRoutes);
app.use("/adote", adoteRoutes);
app.use("/adote/:id/comments",commentRoutes);





// iniciar server


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("LOBO server has started!!!");
});