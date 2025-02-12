const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
//requisição do modelo de Categoria
require("../models/Category")
const Category = mongoose.model("categories")

//requisição do modelo de Postagem
require("../models/Post")
const Post = mongoose.model("posts")

const {isAdmin} = require("../helpers/isAdmin")

//rota inicial
router.get("/", isAdmin, (req, res) => {
    res.render("admin/index")
})

//rota para listagem de categorias
router.get("/categories", isAdmin, (req, res) => {
    Category.find().sort({date: "DESC"}).then((categories) => {
        res.render("admin/categories", { categories: categories})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

//rota para preencher o formulário de cadastro de categorias
router.get("/categories/add", isAdmin, (req, res) => {
    res.render("admin/addcategories")
})

//rota que recebe os valores do formulário de cadastro de categoria
router.post("/categories/new", isAdmin, (req, res) => {

    let erros = []

    //validando se o nome está vazio, indefinido ou nulo
    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        erros.push({texto: "Nome inválido"})
        //validando se o nome é curto demais
    } else if(req.body.name.length < 3) {
        erros.push({texto: "O nome inserido é muito pequeno"})
    }

    //validando se o slug está vazio, indefinido ou nulo
    /*if(!req.body.slug || typeof !req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido"})
    }*/

    //verificando se ocorreu algum erro, senão cadastrará no banco de dados
    if(erros.length > 0) {
        res.render("admin/addcategories", {erros: erros})
    } else {

        const newCategory = {
            name: req.body.name,
            slug: req.body.name.toLowerCase().replace(/"|á|â|à|ã|ä"/g, "a").replace(/"|é|ê|è|ë"/g, "e").replace(/"|í|ì|î|ï"/g, "i").replace(/"|ó|ò|ô|õ|ø|ö"/g, "o").replace(/"|ú|ù|û|ü"/g, "u").replace(/ç/g, "c").replace(/ñ/g, "n").replace(/ý/g, "y").replace(/ /g, "-")
        }
    
        new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categories")
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao criar a categoria, tente novamente")
        })
    }
})

//rota para editar a categoria
router.get("/categories/edit/:id", isAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render("admin/editcategories", {category: category})
    }).catch((erro) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categories")
    })
    
})

//rota que recebe os valores do formulário de edição de categoria
router.post("/categories/edit", isAdmin, (req, res) => {
    Category.findOne({_id: req.body.id}).then((category) => {
        let erros = []

        //validando se o nome está vazio, indefinido ou nulo
        if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
            erros.push({texto: "Nome inválido"})

            //validando se o nome é curto demais
        } else if(req.body.name.length < 3) {
            erros.push({texto: "O nome inserido é muito pequeno"})
        }

        // //validando se o slug está vazio, indefinido ou nulo
        // if(!req.body.slug || typeof !req.body.slug == undefined || req.body.slug == null) {
        //     erros.push({texto: "Slug inválido"})
        // }
    
        //verificando se ocorreu algum erro, senão editará no banco de dados
        if(erros.length > 0) {
            res.render("admin/editcategories", {erros: erros})
        } else {
            category.name = req.body.name
            category.slug = req.body.name.toLowerCase().replace(/"|á|â|à|ã|ä"/g, "a").replace(/"|é|ê|è|ë"/g, "e").replace(/"|í|ì|î|ï"/g, "i").replace(/"|ó|ò|ô|õ|ø|ö"/g, "o").replace(/"|ú|ù|û|ü"/g, "u").replace(/"ç"/g, "c").replace(/"ñ"/g, "n").replace(/"ý"/g, "y").replace(/ /g, "-")

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

//rota que recebe o formulário para deletar a categoria
router.post("/categories/delete", isAdmin, (req, res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash("sucess_msg", "Categoria excluída com sucesso")
        res.redirect("/admin/categories")
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao deletar essa categoria")
        res.send("/admin/categories")
    })
})

//rota para listagem de postagens
router.get("/posts", isAdmin, (req, res) => {
    Post.find().populate("category").sort({date: "DESC"}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

//rota para preencher o formulário de cadastro do postagens
router.get("/posts/add", isAdmin, (req, res) => {
    Category.find().then((categories) => {
        res.render("admin/addposts", {categories: categories})
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("admin/posts")
    })
    
})

//rota que recebe os valores enviados pelo formulário de cadastro de postagens
router.post("/posts/new", isAdmin, (req, res) => {

    let erros = []

    //validando se o titulo da postagem está vazio, indefinido ou nulo
    if(!req.body.title || typeof !req.body.title == undefined || req.body.title == null){
        erros.push({texto: "Título inválido"})
            //validando se o título da postagem é curto demais
    }else if(req.body.title.length < 3) {
        erros.push({texto: "O título inserido é muito pequeno"})
    }

    //validando a categoria
    if(req.body.category == 0) {
        erros.push({texto: "Necessário cadastrar uma categoria"})
    }

    //validando se o slug da postagem está vazio, indefinido ou nulo
    //if(!req.body.slug || typeof !req.body.slug == undefined || req.body.slug == null){
    //   erros.push({texto: "Slug inválido"})
    //}

    //verificando se ocorreu algum erro, senão cadastrará no banco de dados
    if (erros.length > 0) {
        res.render("admin/addposts", {erros: erros})
    } else {
        const newPost = {
            title:  req.body.title,
            slug: req.body.title.toLowerCase().replace(/"|á|â|à|ã|ä"/g, "a").replace(/"|é|ê|è|ë"/g, "e").replace(/"|í|ì|î|ï"/g, "i").replace(/"|ó|ò|ô|õ|ø|ö"/g, "o").replace(/"|ú|ù|û|ü"/g, "u").replace(/ç/g, "c").replace(/ñ/g, "n").replace(/ý/g, "y").replace(/ /g, "-"),
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }
    
        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/posts")
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao criar a postagem, tente novamente")
        })
    }


})

//rota para editar a postagem
router.get("/posts/edit/:id", isAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).then((post) => {
        Category.find().then((categories) => {
            res.render("admin/editposts", {post: post, categories: categories})
        }).catch(() => {
                req.flash("error_msg", "Houve um erro ao listar as categorias")
                res.redirect("/admin/posts")
            })
    }).catch(() => {
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect("/admin/posts")
        })
    
})

//rota que recebe os valores do formulário de edição de postagem
router.post("/posts/edit", isAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((post) => {
        let erros = []

        //validando se o nome está vazio, indefinido ou nulo
        if(!req.body.title || typeof !req.body.title == undefined || req.body.title == null) {
            erros.push({texto: "Título inválido"})

            //validando se o nome é curto demais
        } else if(req.body.title.length < 3) {
            erros.push({texto: "O título inserido é muito pequeno"})
        }
        
        //validando a categoria
        if(req.body.category == 0) {
            erros.push({texto: "Necessário cadastrar uma categoria"})
        }
    
        //verificando se ocorreu algum erro, senão editará no banco de dados
        if(erros.length > 0) {
            res.render("admin/editposts", {erros: erros})
        } else {
            post.title = req.body.title,
            post.slug = req.body.title.toLowerCase().replace(/"|á|â|à|ã|ä"/g, "a").replace(/"|é|ê|è|ë"/g, "e").replace(/"|í|ì|î|ï"/g, "i").replace(/"|ó|ò|ô|õ|ø|ö"/g, "o").replace(/"|ú|ù|û|ü"/g, "u").replace(/"ç"/g, "c").replace(/"ñ"/g, "n").replace(/"ý"/g, "y").replace(/ /g, "-"),
            post.description = req.body.description,
            post.content = req.body.content,
            post.category = req.body.category

            post.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                res.redirect("/admin/posts/")
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao interno ao salvar a edição")
                res.redirect("/admin/posts/")
            })
        }  
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao editar a postagem")
        res.redirect("/admin/posts")
    })
})

//rota que recebe o formulário para deletar a postagem
router.post("/posts/delete", isAdmin, (req, res) => {
    Post.deleteOne({_id: req.body.id}).then(() => {
        req.flash("sucess_msg", "Postagem excluída com sucesso")
        res.redirect("/admin/posts")
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao deletar essa postagem")
        res.send("/admin/posts")
    })
})

module.exports = router