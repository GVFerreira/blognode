//Carregando módulos
    const express = require("express")
    const handlebars = require("express-handlebars")
    const handle = handlebars.create({defaultLayout: "main", runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,}})
    const bodyParser = require("body-parser")
    const app = express()
    const admin = require("./routes/admin")
    const users = require("./routes/users")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")
    //requisição do modelo de Postagem
        require("./models/Post")
    const Post = mongoose.model("posts")
    //requisição do modelo de Categoria
        require("./models/Category")
    const Category = mongoose.model("categories")
    //autenticação
    const passport = require("passport")
        require("./config/auth")(passport)

    //db
    const db = require("./config/db")


//Configs
    //Sessão
        app.use(session({
            secret: "123456",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null

            next()
        })

    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //Handlebars
        app.engine("handlebars", handle.engine)
        app.set("view engine", "handlebars")

    //Mongoose
        mongoose.connect(db.mongoURI).then(() => {
            console.log("MongoDB connected...")
        }).catch((erro) => {
            console.log(`Erro: ${erro}`)
        })

    //Public
        app.use(express.static(path.join(__dirname, "public")))


//Rotas
    //Pública
        app.get("/", (req, res) => {
            Post.find().populate("category").sort({date: "DESC"}).then((posts) => {
                res.render("index", {posts: posts})
            }).catch(() => {
                res.redirect("/404")
                req.flash("error_msg", "Houve um erro interno ao carregar as postagens recentes")
            })
        })

        app.get("/posts/:slug", (req, res) => {
            Post.findOne({slug: req.params.slug}).then((post) => {
                if(post) {
                    res.render("posts/index", {post: post})
                } else {
                    req.flash("error_msg", "Esta postagem não existe")
                    res.redirect("/")
                }
            }).catch(() => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
        })

        app.get("/categories", (req, res) => {
            Category.find().sort({date: "DESC"}).then((categories) => {
                res.render("categories/index", {categories: categories})
            }).catch(() => {
                req.flash("error_msg", "Houve um erro ao carregar as categorias")
                res.redirect("/")
            })
        })

        app.get("/categories/:slug", (req, res) => {
            Category.findOne({slug: req.params.slug}).then((category) => {
                if(category) {
                    Post.find({category: category._id}).then((posts) => {
                        res.render("categories/posts", {posts: posts, category: category})
                    }).catch(() => {
                        req.flash("error_msg", "Houve um erro ao listar as postagens dessa categoria")
                        res.redirect("/categories")
                    })

                }else {
                    req.flash("error_msg", "Essa categoria não existe")
                    res.redirect("/categories")
                }

            }).catch(() => {
                req.flash("Houve um erro ao carregar as postagem dessa categoria")
                res.redirect("/categories")
            })
        })

        app.get("/404", (req, res) => {
            res.send("Erro 404!")
        })

        
    //Admin
        app.use("/admin", admin)
        app.use("/users", users)


//Outros
    const PORTA = process.env.PORT || 8000
    app.listen(PORTA, () => {
        console.log("Server ON!")
    })

