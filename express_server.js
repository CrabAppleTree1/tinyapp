const express = require("express");
const app = express();
const port = 8080;

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log(`listning on port ${port}`)
});


