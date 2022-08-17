const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");
const auth = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const app = express();

require("dotenv").config();

mongoose.connect("mongodb+srv://" + process.env.MDB_USER + ":" + process.env.MDB_USER_PW + "@cluster0.inar2.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(helmet());

//CORS
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", auth);

app.use("/api/sauces", sauceRoutes);

module.exports = app;