var express = require("express");
var router = express.Router();
var Animal = require("../models/animal");
var middlewareObj = require("../middleware/index");

//Cloudinary and multer configuration (Image upload)
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Somente imagens sao permitidas!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dt6x7dyxc', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//END Cloudinary and multer configuration (Image upload)


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
router.post("/",middlewareObj.isLoggedIn,upload.single('image'), function(req,res){
cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property

  req.body.image = result.secure_url;
  req.body.imageId = result.public_id;
    
   var name = req.body.name;
   var image = req.body.image;
   var imageId = req.body.imageId;
   var price = req.body.price;
   var description = req.body.description;
   var author = {
       id: req.user._id,
   username: req.user.username
   };
   var newAnimal = {name:name, image:image, imageId:imageId, description:description, author:author, price:price};
  
   
  Animal.create(newAnimal, function(err,novoanimal){
     if (err) {
         req.flash("error",err);
         res.redirect("back");
     }  else {

 
          res.redirect("/adote/"+ novoanimal.id);
     }
       
  });
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
router.put("/:id", middlewareObj.checkAnimalOwnership, upload.single('image'), function(req,res) {

 if (req.file) {
    Animal.findById (req.params.id, function(err, animal) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
    }
    //delete the file from cloudinary
    cloudinary.v2.uploader.destroy(animal.imageId, function(err,result) {
        if(err) {
            req.flash("error",err.message);
            return res.redirect("back");
        }
    //Upload a new one
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
            req.flash("error",err.message);
            return res.redirect("back");
        }
    // add cloudinary url for the same image to the animal object under image propety
    req.body.image = result.secure_url;
    //add image public_id to animal object
    req.body.imageId = result.public_id;
     Animal.findByIdAndUpdate(req.params.id, req.body, function (err, foundAnimal) {
            if(err) {
                req.flash("error",err.message);
                res.redirect("back");
            } else {
                req.flash("success","Editado com sucesso");
                res.redirect("/adote/"+req.params.id);
            }
    });
    });
    });
}); } else {
    
Animal.findByIdAndUpdate(req.params.id, req.body, function (err, foundAnimal) {
        if(err) {
            req.flash("error",err.message);
            res.redirect("back");
        } else {
            req.flash("success","Editado com sucesso");
            res.redirect("/adote/"+req.params.id);
        }
});
}
});

// DELeTE
router.delete("/:id", middlewareObj.checkAnimalOwnership, function(req,res) {
    //delete the file from cloudinary
    Animal.findById (req.params.id, function(err, animal) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
    }
    cloudinary.v2.uploader.destroy(animal.imageId, function(err,result) {
        if(err) {
            req.flash("error",err.message);
            return res.redirect("back");
        }
    });
    });
    //delete animal from db
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