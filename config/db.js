if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://gust4v0:<password>@blognode.5k7cp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blognode"}
}