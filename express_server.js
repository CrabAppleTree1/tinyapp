const express = require("express");
const app = express();
const port = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (require, response) => {
  response.send('H 3 l l @ ');
});

app.listen(port, () => {
  console.log(`listning on port ${port}`)
})