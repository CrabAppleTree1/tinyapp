const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-parser");
const app = express();
const port = 8080;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const {
  findByEmail,
  authenticateUser,
  addUser,
  generateRandomString,
  urlsForUser
} = require('./helpers');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    path    : '/',
    name: "session",
    //seed
    keys: ["dawg you never going to break this seed", "unless you know how i talk when i type"],
  })
);
app.use(express.static('public'));
//URL db
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "the32w"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "the32w"
  }
};
//users db
const users = {
  "user": {
    id: "001",
    email: "r@e.com",
    password: "purp"
  },
  "user2": {
    id: "002",
    email: "2@ex.com",
    password: "dish"
  }
};


app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
 
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let newUrl = req.body.newUrl;
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send("Permission denied");
    return;
  }
});
//edit page for valid user
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect("/urls/" + shortURL);
    return;
  } else {
    res.status(403).send("Permission denied");
    return;
  }
  
});
//lodging with email and password
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  if (user) {
    req.session.user_id = user.userId;
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Invalid input");
});
//lodging out clears clookies and return to resister
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/register");
});
//Create new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const validUser = findByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('Invalid Entry');
  } else if (validUser) {
    return res.status(400).send('User already Exists');
  }
  const user = addUser(email, password, users);
  req.session.user_id = user._userID;
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  var newLongURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  console.log("this is from the post urls :id section: " + urlDatabase[newLongURL]);
  res.redirect("/urls");
});
//***********************************************************Post/GET line */

//*****initial tests ******************************************************/
app.get('/', (require, response) => {
  response.send('H 3 l l @ ');
});
app.get('/urls.json', (require, response) => {
  response.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//********************************************************* initial tests **/

// renders the user's short url / long url
app.get("/users.json", (req, res) => {
  res.json(users);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// app.get("/urls", (req, res) => {
//   const userID = req.session.user_id;
//   const loggedIn = users[userID];
//   if (!loggedIn) {
//     res.status(401).send("Permission Denied, Please login");
//   }
//   const filteredURLs = urlsForUser(userID, urlDatabase);
//   const templateVars = {
//     urls: filteredURLs,
//     user: loggedIn
//   };
//   res.render("urls_index", templateVars);
// });
app.get("/urls", (req, res) => {

  let templateVars = {
    urlDatabase: urlsForUser(req.session["user_id"]),
    user: req.session["user_id"]
  };
  res.render("urls_index", templateVars);
});
//take user to lodgings
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});
//take user to register new lodger
app.get("/register", (req, res) => {
  const templateVars = {
    email: req.session.email,
    password: req.session.password,
    user: null
  };
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

//take user to urls_new
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];
  
  const templateVars = {
    user: loggedIn
  };
  if (!loggedIn) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  if (req.session["user_ID"] === urlDatabase[req.params.id].userID) {
    let templateVars = {
      user: users[req.session["user_ID"]],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(550).send("You can't do that");
  }
 });

//renders valid long url for short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send("shortURL not found");
  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.status(404).send("Page not found");
  }
  res.redirect(longURL);
});

//edit page for valid user
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
    return;
  } else {
    res.status(404).send("Permission Denied");
    return;
  }
});



app.listen(port, () => {
  console.log(`listning on port ${port}`);
});

