module.exports = {
    isAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin == 1){
            return next()
        }
        req.flash("error_msg", "Você deve ser um administrador e estar autenticado para acessar essa página")
        res.redirect("/")
    }
}