var express = require("express");
var router = express.Router();

var passport = require("passport"),
User        = require("../models/user"),
Animal = require("../models/animal");



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
   var newUser = new User({
       username: req.body.username,
       firstName: req.body.firstName,
       lastName: req.body.lastName,
       avatar: req.body.avatar,
       email:req.body.email
   });

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



//User profile
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err,foundUser) {
        if (err || !foundUser) {
            req.flash("error","User nao encontrado");
            res.redirect("back");
        } else {
            Animal.find().where('author.id').equals(foundUser._id).exec(function(err, foundAnimais) {
                  if(err|| !foundAnimais) {
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/");
                  }
                  res.render("authentication/users.ejs", {user: foundUser, animais: foundAnimais});
            });
        }
        
        
    });
});



module.exports = router;