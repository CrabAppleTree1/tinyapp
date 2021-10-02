const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-parser");
const app = express();
const port = 8080;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {

  return Math.random().toString(36).substring(2, 9);
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "r@e.com", 
    password: "purp"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "2@ex.com", 
    password: "dish"
  }
}
// Add User
const addUser = function(email, password, users) {
  const userId = generateRandomString();

  users[userId] = {
    id: userId,
    email: email,
    password: bcrypt.hashSync(password, salt)
  };

  return userId;
};
app.use(cookieSession({
  name: 'session',
  //[/* secret keys */],
  keys: ['the secretests keys are amissspelling', 'you wont get this key in a few thousand sweyears'], 
   // Cookie Options
   maxAge: 24 * 60 * 60 * 1000 // 24 hours
  
}));



app.post("/urls", (req, res) => {  //when post to /urls
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);  //redirects to /urls/:shortURL
});
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let newUrl = req.body.newUrl;
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");

})
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);

});
app.post("/login", (req, res) => {
    res.cookie('username', req.body.username);
    console.log('correct')
    res.redirect("/urls");
   
});
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`); 
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUsersByEmail(email, users);

  if (userFound) {
    res.status(400).send("user already exists");
    return;
  }
  
  // Create new user and assign it with a new cookie session
  const userId = addUser(email, password, users);
  req.session['user_id'] = userId;

  res.redirect('/urls');
});
//***********************************************************Post/GET line */
app.get("/register", (req, res) => {
  // const templateVars = { user: null };
  const email = req.session['email'];
  res.render("urls_register");
});
app.get('/', (require, response) => {
  response.send('H 3 l l @ ');
});
app.get('/urls.json', (require, response) => {
  response.json(urlDatabase)
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log(`listning on port ${port}`)
});


