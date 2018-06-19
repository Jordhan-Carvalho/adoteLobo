var express = require("express");
var router = express.Router();
var Animal = require("../models/animal");
var middlewareObj = require("../middleware/index");



// INDEX ROUTE
router.get("/", function(req,res){

//   res.render("adote.ejs", {lista:campgrounds});  
Animal.find({}, function(err,animal) {
if(err) {
    console.log(err);
}    else {
    res.render("animais/index.ejs", {lista:animal});
}
});

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





module.exports = router;