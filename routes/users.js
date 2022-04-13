const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
    require("../models/User")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const passport = require("passport")
    require("../config/auth")(passport)

router.get("/register", (req, res) => {
    res.render("users/register")
})

router.post("/new", (req, res) => {

    let errors = []

    if(!req.body.name || typeof !req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Nome inválido"})
    }

    if(!req.body.email || typeof !req.body.email == undefined || req.body.email == null) {
        errors.push({text: "E-mail inválido"})
    }

    if(req.body.password.length < 4) {
        errors.push({text: "Senha muito curta"})
    }

    if(req.body.password != req.body.password2) {
        errors.push({text: "As senhas não coincidem"})
    }

    if(errors.length > 0) {
        res.render("users/register", {errors: errors})
    }else {
        User.findOne({email: req.body.email}).then((user) => {
            if(user) {
                req.flash("error_msg", "E-mail já cadastrado")
                res.redirect("/users/register")
            } else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                //criptografar senha
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            req.flash("error_msg", "Houve um erro durante o registro do usuário")
                            res.redirect("/users/register")
                        } 

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário registrado com sucesso")
                            res.redirect("/")
                        }).catch(() => {
                            req.flash("error_msg", "Houve um erro ao registrar o seu usário")
                            res.redirect("/users/register")
                        })
                    })
                })
            }
        }).catch(() => {
            req.flash("error_msg", "House um erro interno")
            res.redirect("/users/register")
        })
    }


})

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Sessão finalizada com sucesso")
    res.redirect("/")
})



module.exports = router