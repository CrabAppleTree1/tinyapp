const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const port = 8080;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
// const findByEmail = require('./helpers');
// const authenticateUser = require('./helpers');
// const addUser = require('./helpers');
// const generateRandomString = require('./helpers');
// const urlsForUser = require('./helpers');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    
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
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 9);
};
//confirm passwordhas for email
const authenticateUser = function(email, password, users) {
  const userFound = findByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return false;
};
const findByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};
const urlsForUser = function(id) {
  let myURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      myURLs[key] = urlDatabase[key];
    }
  }
  return myURLs;
};
const addUser = function(email, password, users) {
  const hashedPassword = bcrypt.hashSync(password, salt);
  const userId = generateRandomString();
  users[userId] = { userId, email, password: hashedPassword };
  return userId;
};
//users db
const password1 = "purp";
const hP1 = bcrypt.hashSync(password1, 10);
const password2 = 'dish';
const hP2 = bcrypt.hashSync(password2, 10);
const users = {
  "user": {
    id: "001",
    email: "r@e.com",
    password: hP1
  },
  "user2": {
    id: "002",
    email: "2@ex.com",
    password: "di"
  }
};





app.get("/users.json", (req, res) => {
  res.json(users);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const urls = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: urls,
    user: user
  };
  if (!req.session.user_id) {
    res.status(403).send("You should login / register first.");
    return;
  }
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
  res.render("login.ejs", templateVars);
});

//take user to register new lodger
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars); //displays the registeration page
});

//take user to urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: req.session.email,
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
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






app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  if (user) {
    req.session.user_id = user.id; //res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  }
  res.status(401).send('Incorrect password or email!');
});
app.post("/urls", (req, res) => {
  const templateVars = {
    shortURL: generateRandomString(),
    longURL: req.body.longURL
  };
  const shortURL =  templateVars.shortURL;
  urlDatabase[shortURL] =  {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect("/urls/" + shortURL);
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


//*****initial tests ******************************************************/
app.get('/', (require, res) => {
  // res.send('H 3 l l @ ');
  res.redirect("/register");
});
app.get('/urls.json', (require, response) => {
  response.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//********************************************************* initial tests **/

// renders the user's short url / long url




app.listen(port, () => {
  console.log(`listning on port ${port}`);
});

