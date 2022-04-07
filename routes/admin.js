const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model("categories")

router.get("/", (req, res) => {
    res.render("admin/index")
})

router.get("/posts", (req, res) => {
    res.send("Posts page")
})

router.get("/categories", (req, res) => {
    Category.find().then((categories) => {
        res.render("admin/categories", { categories: categories})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get("/categories/add", (req, res) => {
    res.render("admin/addcategories")
})

router.post("/categories/new", (req, res) => {
    var erros = []

    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        erros.push({texto: "Nome inválido"})
    } else if(req.body.name.length < 3) {
        erros.push({texto: "O nome inserido é muito pequeno"})
    }

    if(!req.body.slug || typeof !req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido"})
    }

    if(erros.length > 0) {
        res.render("admin/addcategories", {erros: erros})
    } else {
        const newCategory = {
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categories")
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao criar a categoria, tente novamente")
        })

        
        
    }

    
})

module.exports = router