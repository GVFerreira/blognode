//Carregando módulos
    const express = require("express")
    const handlebars = require("express-handlebars")
    const handle = handlebars.create({defaultLayout: "main", runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,}})
    const bodyParser = require("body-parser")
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")


//Configs
    //Sessão
        app.use(session({
            secret: "123456",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })

    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //Handlebars
        app.engine("handlebars", handle.engine)
        app.set("view engine", "handlebars")

    //Mongoose
        mongoose.connect("mongodb://localhost/blognode").then(() => {
            console.log("MongoDB connected...")
        }).catch((erro) => {
            console.log(`Erro: ${erro}`)
        })

    //Public
        app.use(express.static(path.join(__dirname, "public")))


//Rotas
    //Pública
        app.get("/", (req, res) => {
            res.send("Public home page")
        })

    //Admin
        app.use("/admin", admin)


//Outros
    const PORTA = 8000
    app.listen(PORTA, () => {
        console.log("Server ON!")
    })

