const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 8080;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {

  return Math.random().toString(36).substring(2, 9);
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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
//***********************************************************Pose/GET line */
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log(`listning on port ${port}`)
});


