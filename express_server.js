const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const express = require("express");
const app = express();
const PORT = 8080; 
const { userDb, urlDatabase, getUserByEmail, generateRandomString, addNewUser, urlsForUser } = require("./helpers");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['keys'],
}));

//////// ROUTES --------------------------------------------------------------------------

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});
app.get("/register", (req, res) => {
  let templateVars = {
    user: null
  };
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, userDb);
  if (user) {
    return res.status(401).send('User already exists');
  }
  if (email === " " || password === " ") {
    return res.status(400).send('Invalid entry');
  }
  const userID = addNewUser(email, password, userDb);
  req.session["user_id"] = userID;
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: userDb[req.session["user_id"]]
  };
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, userDb);
  if (!user) {
    return res.status(400).send('Invalid entry');
  } else if ((!bcrypt.compareSync(password, user.password))) {
    return res.status(400).send('Invalid entry');
  } else {
    req.session["user_id"] = user.id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});



app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const user = userDb[userID];
  if (!user) {
    return res.status(403).send("First Login");
  }
  const urls = urlsForUser(user.id);
  const templateVars = { urls, user };
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (userDb[req.session["user_id"]]) {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };
    return res.redirect(`/urls/${randomString}`);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDb[req.session["user_id"]]
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.render("login", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.redirect(`/urls`);
  } else {
    return res.status(403).send("First Login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars =
    {
      user: userDb[req.session["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    return res.render("urls_show", templateVars);
  }
  return res.status(404).send("Page not Found");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  } else {
    return res.status(403).send("First Login");
  }
});


app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(fullURL);
  }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});