// all middlewares goes here
var Comment     = require("../models/comment"),
Animal      = require("../models/animal");

var middlewareObj = {};

middlewareObj.checkCommentOwnership = function (req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               req.flash("error","Erro! Contatar administrador");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error","Nao possui permissao");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error","Nao possui permissao");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Você precisa estar logado!");
    res.redirect("/login");
};

middlewareObj.checkAnimalOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Animal.findById(req.params.id, function(err, foundAnimal){
           if(err || !foundAnimal){
               req.flash("error", "Ocorreu algum erro, reporte ao admin");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundAnimal.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error","Nao possui permissão");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error","Você precisa ser o criador para realizar a ação!");
        res.redirect("back");
    }
};

module.exports = middlewareObj;