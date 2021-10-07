const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
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
const users = {
  "user": {
    id: "001",
    email: "r@e.com",
    password: "pu"
  },
  "user2": {
    id: "002",
    email: "2@ex.com",
    password: "di"
  }
};

// generate random 7 letter string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 9);
};
// Add User to db
const addUser = function(email, password, users) {
  const hashedPassword = bcrypt.hashSync(password, salt);
  const userId = generateRandomString();
  users[userId] = { userId, email, password: hashedPassword };
  return userId;
};
//confirm email in user db
const findByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};
//confirm passwordhas for email
const authenticateUser = function(email, password, users) {
  const userFound = findByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return false;
};
 
//object of user urls
const urlsForUser = function(id)  {
  let usersItems = {};
  for (let elem in urlDatabase) {
    if (urlDatabase[elem].userID === id) {
      usersItems[elem] = urlDatabase[elem];
    }
  }
  return usersItems;
};

module.exports = {generateRandomString, addUser, findByEmail, authenticateUser, urlsForUser};