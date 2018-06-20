var express = require("express");
var router = express.Router();

var passport = require("passport"),
User        = require("../models/user");



// Inicio das Routes

router.get("/", function(req,res) {
    
 res.render("landing.ejs");   
});



// =============================
// AUTH ROUTES
// =============================
// show register form
router.get("/register", function(req, res) {
   res.render("authentication/register.ejs"); 
});





router.post("/register", function(req, res) {
   var newUser = new User({username: req.body.username});
   if (req.body.admin==process.env.ISADMIN) {
       newUser.isAdmin= true;
   }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            // modificando a error msg
            if (err.name=='UserExistsError') {
             req.flash("error","Usuario existente!");
             console.log(err);
            return res.redirect('/register');
            } else {
            req.flash("error",err.message);
            console.log(err);
            return res.redirect('/register');
            }
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Registrado com sucesso! Seja bem-vindo "+user.username);
           res.redirect("/adote");
        });
    });
    
});
// login
router.get("/login", function(req, res) {
   res.render("authentication/login.ejs") 
});
    
router.post("/login", passport.authenticate("local", {
    successRedirect: "/adote",
    failureRedirect: "/login"
}) ,function(req, res) {
});

//logout
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success","Deslogado com sucesso!");
   res.redirect("/adote");
});


module.exports = router;