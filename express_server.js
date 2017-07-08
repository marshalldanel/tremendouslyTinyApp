const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

//////
//// #URL DATABASE ////
//////

var urlDatabase = {
};

//////
//// #USER DATABASE ////
//////

var usersDB = {
  'ObD653': {
    id: 'ObD653',
    email: 'joe@joe.com',
    password: '$2a$10$EdlUDTJMykbVAQJAkjffL.0eHEUTtyEoILkGewQAMj/0wjrTzTSeC'
  }
};

//////
//// #MIDDLEWARE ////
//////

app.use(cookieSession({
  name: 'poop',
  keys: ["hksdn"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
  res.locals = {
    user: usersDB[req.session.userId]
  };
  next();
});

//////
//// #HELPER FUNCTIONS ////
//////

getRandomString = function() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length ));
  }
  return text;
};

function emailPassMatch(formEmail) {
  for (let item in usersDB) {
    if (usersDB[item].email === formEmail) {
      return usersDB[item].password;
    }
  }
}

function userLookup(formEmail) {
  for (let item in usersDB) {
    if (usersDB[item].email === formEmail) {
      return usersDB[item];
    }
  }
}

function emailExist(formEmail) {
  return Boolean(userLookup(formEmail));
}

//////
//// #EASTER EGG ////
//////

app.get('/hello', (req, res) => {
  res.end('<a href="http://heeeeeeeey.com/">Hello</a>');
});

//////
//// #URLS ////
//////

function urlsForUser(id) {
  let userURL = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].user === id) {
      userURL[item] = urlDatabase[item].longURL;
    }
  }
  return userURL;
}

app.get('/urls', (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect('/login');
  } else {
    const newUserUrls = urlsForUser(req.session.userId);
    const templateVars = { urls: newUserUrls};
    res.render('urls_index', templateVars);
  }
});

app.post('/urls', (req, res) => {
  let randStr = getRandomString();
  let user = usersDB[req.session.userId];
  urlDatabase[randStr] = {
    longURL: req.body.longURL,
    user: usersDB[req.session.userId].id
  };
  res.redirect(`/urls/${randStr}`);
});

//////
//// #NEW ////
/////

app.get('/urls/new', (req, res) => {
  if (!usersDB[req.session.userId]) {
    res.redirect('/login');
  } else {
    res.render('urls_new');
  }
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.sendStatus(404);
  }
});

//////
//// #ID ////
//////

app.get('/urls/:id', (req, res) => {
  if (!usersDB[req.session.userId]) {
    res.redirect('/login');
  } else {
    const shortURL = req.params.id;
    const longURL = urlDatabase[req.params.id];
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    res.render('urls_show', templateVars);
  }
});

// Update
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = {longURL: req.body.longURL, user: usersDB[req.session.userId].id};
  res.redirect('/urls/');
});

app.post('/urls/:id/delete', (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!usersDB[req.session.userId] || url === undefined) {
    res.redirect('/login');
    res.status(404).send(`Cannot delete ${url}`);
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

//////
//// #LOGIN/OUT ////
//////

app.get('/login', (req, res) => {
  res.render('urls_login');
});

app.post('/login', (req, res) => {
  let userInfo = userLookup(req.body.email);
  if (userInfo === undefined) {
    res.status(403).send('Please enter a valid email/password');
  } else {
    if (!bcrypt.compareSync(req.body.password, userInfo.password)) {
      res.status(403).send('Please enter a valid email/password');
    } else {
      req.session.userId = userInfo.id;
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

///////
//// #PORT LISTEN ////
//////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//////
//// #REGISTRATION ////
//////

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  const randUser = getRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userID = usersDB.userID;
  if (!email || !password) {
    res.status(400).send('Please enter a valid email/password');
  } else if (emailExist(req.body.email)) {
    res.status(400).send('That email address is already registered, please try again');
  } else {
    usersDB[randUser] = {
      id: randUser,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.userId = randUser;
    res.redirect('/urls/');
  }
});