const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

/****************************  MySQL Connection set up  ****************************************/
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "3306",
  password: "Abm20089!",
  database: "usersdatabase",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Database connected...");
});

// for bccypt
const saltRounds = 10;

router.get("/", (req, res) => {
  // home page
  res.render("../views/pages/index", { data: { partial: "login" } });
});

/****************************  Login Page  ****************************************/
router.get("/login", (req, res) => {
  res.render("../views/pages/index.ejs", { data: { partial: "login" } });
});

// posting to login page
router.post("/login", (req, res) => {});

/****************************  Register Page  ****************************************/
// visiting register page
router.get("/register", (req, res) => {
  res.render("../views/pages/index.ejs", { data: { partial: "register" } });
});

// handling registration process
router.post("/register", (req, res) => {
  var errors = [];

  // Step 1: check if username already taken
  con.query(
    `SELECT username FROM Login_Info WHERE username = '${req.body.username}';`,
    (err, result) => {
      if (err) console.log(err.code);

      if (result.length > 0) {
        errors.push("username taken.");
      }

      // username should be longer than 7 letters
      if (req.body.username.length <= 7) {
        errors.push("username should be longer than 7 letters.");
      }
      // passwords should be longer than 7 letters
      if (req.body.password.length <= 7) {
        errors.push("password should be longer than 7 letters.");
      }

      // at least a uppercase
      let passwordArr = req.body.password.split("");
      const hasUpperCase = passwordArr.some(
        (letter) => letter === letter.toUpperCase()
      );
      if (!hasUpperCase)
        errors.push("Password should at least contain one upper case letter.");

      // at least a special letter
      const specialChar = "~!@#$%^&*_-+=`|(){}[]:;\"'<>,.?/";
      const hasSpecLet = passwordArr.some((letter) =>
        specialChar.includes(letter)
      );
      if (!hasSpecLet)
        errors.push(
          `Password should contain at least 1 special letter: i.e.(~!@#$%^&*_-+=\`|(){}[]:;\"'<>,.?/)`
        );

      // Step 2: check if password matches
      if (req.body.password !== req.body.confirm_password) {
        errors.push("passwords don't match.");
      }

      // Finally: if no error
      if (errors.length === 0) {
        // hash passwords
        const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);
        // insert new user
        con.query(
          `INSERT INTO Login_Info VALUES ('${uuid.v4()}','${
            req.body.username
          }','${hashedPassword}')`,
          (err, result, fields) => {
            if (err) throw err;
            console.log("1 new user inserted into Login_Info.");
          }
        );
        res.render("../views/pages/index.ejs", {
          data: {
            partial: "login",
            msg: "Account created! Please login with your credentials.",
          },
        });
      } else {
        // send back to register page with errors messages
        res.render("../views/pages/index.ejs", {
          data: { partial: "register", errors },
        });
      }
    }
  );
});

module.exports = router;
