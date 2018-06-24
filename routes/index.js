var express = require("express");
var router = express.Router();

var passport = require("passport"),
User        = require("../models/user"),
Animal = require("../models/animal"),
async = require("async"),
nodemailer = require("nodemailer"),
crypto = require("crypto");



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
   res.render("authentication/login.ejs"); 
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

//RESET PASSWORD CONFIG

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot.ejs');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
     
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
      //HAVE TO CHANGE EMAIL
        service: 'Gmail', 
        auth: {
          user: 'bianca.jordhan@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'bianca.jordhan@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});
//MAKE THE NEW PASS FORM
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset.ejs', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    //EMAIL CONFIRMING PASSWORD CHANGE
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'bianca.jordhan@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'bianca.jordhan@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/adote');
  });
});


module.exports = router;