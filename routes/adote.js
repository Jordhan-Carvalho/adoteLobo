var express = require("express");
var router = express.Router();
var Animal = require("../models/animal");
var middlewareObj = require("../middleware/index");



// INDEX ROUTE
router.get("/", function(req,res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Animal.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allAnimais) {
            Animal.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allAnimais.length < 1) {
                        res.flash("error", "Animal nao encontrado");
                        res.redirect("back");
                    }
                    res.render("animais/index.ejs", {
                        lista: allAnimais,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Animal.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allAnimais) {
            Animal.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("animais/index.ejs", {
                        lista: allAnimais,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
        });
    }
});

// NEW ROUTE
router.get("/novo", middlewareObj.isLoggedIn, function(req, res) {
    res.render("animais/new.ejs");
});


// CREATE ROUTE
router.post("/",middlewareObj.isLoggedIn, function(req,res){
    // pegar a data do form e add to campgrounds array
    // S[o eh possivel com body parser]
   var name = req.body.name;
   var image = req.body.image;
   var price = req.body.price;
   var description = req.body.description;
   var author = {
       id: req.user._id,
   username: req.user.username
   };
   var newAnimal = {name:name, image:image, description:description, author:author, price:price};
  
   
  Animal.create(newAnimal, function(err,novoanimal){
     if (err) {
         console.log(err);
     }  else {
        //  novoanimal.author.username = req.user.username;
        //  novoanimal.author.id = req.user._id;
        //  novoanimal.save();
 
          res.redirect("/adote");
     }
       
  });
  
});

// SHOW ROUTE
router.get("/:id", function(req, res) {
    Animal.findById(req.params.id).populate("comments").exec(function(err, foundAnimal){
       if (err || !foundAnimal) {
        req.flash("error", "Animal nao encontrado");
        res.redirect("back");
       } else {
         
      res.render("animais/show.ejs", {animal:foundAnimal}); 
       }
        
    });
   
});

// ============================
// EDIT UPDATE ROUTES
// ===========================
// edit
router.get("/:id/edit", middlewareObj.checkAnimalOwnership, function(req,res) {
 Animal.findById(req.params.id, function(err, foundAnimal) {
    if (err) {
        console.log(err);
    } else {
        res.render("animais/edit.ejs", {animal:foundAnimal});
    }
 })  ; 
    
});

// update
router.put("/:id", middlewareObj.checkAnimalOwnership, function(req,res) {

    Animal.findByIdAndUpdate(req.params.id, req.body, function (err, foundAnimal) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/adote/"+req.params.id);
        }
        
    });
    
});

// DELeTE
router.delete("/:id", middlewareObj.checkAnimalOwnership, function(req,res) {
   Animal.findByIdAndRemove(req.params.id, function(err) {
       if (err) {
           console.log(err);
       } else {
           req.flash("success","Deletado com sucesso");
           res.redirect("/adote");
       }
   }); 
    
});




// helper function for search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};




module.exports = router;