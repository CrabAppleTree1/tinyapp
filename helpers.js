const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);

const userDb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


// generate random 7 letter string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 9);
};
// Add User to db
const addNewUser = function(email, password, users) {
  const hashPassword = bcrypt.hashSync(password, 10);
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password: hashPassword
  };
  return userID;
};
//confirm email in user db
const getUserByEmail = function(email, users) {
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return undefined;
};

//confirm password has for email
const authenticateUser = function(email, password, users) {
  const userFound = getUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return undefined;
};
 
//object of user urls
const urlsForUser = function(id) {
  const result = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      result[shortURL] = url;
    }
  }
  return result;
};

module.exports = { userDb, urlDatabase, authenticateUser,  getUserByEmail, generateRandomString, addNewUser, urlsForUser };