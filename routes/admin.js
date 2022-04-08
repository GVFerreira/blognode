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
    Category.find().sort({date: "DESC"}).then((categories) => {
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
    let erros = []

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

router.get("/categories/edit/:id", (req, res) => {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render("admin/editcategories", {category: category})
    }).catch((erro) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categories")
    })
    
})

router.post("/categories/edit", (req, res) => {
    Category.findOne({_id: req.body.id}).then((category) => {
        let erros = []

        if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
            erros.push({texto: "Nome inválido"})
        } else if(req.body.name.length < 3) {
            erros.push({texto: "O nome inserido é muito pequeno"})
        }
    
        if(!req.body.slug || typeof !req.body.slug == undefined || req.body.slug == null) {
            erros.push({texto: "Slug inválido"})
        }
    
        if(erros.length > 0) {
            res.render("admin/editcategories", {erros: erros})
        } else {
            category.name = req.body.name
            category.slug = req.body.slug

            category.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                res.redirect("/admin/categories/")
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao interno ao salvar a edição")
                res.redirect("/admin/categories/")
            })
        }  
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categories")
    })
})

module.exports = router