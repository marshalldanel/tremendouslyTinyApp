const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

//// #DATABASE ////

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouse.cs',
  '9sm5xk': 'http://www.google.com'
};

//// #USER DATABASE ////

var usersDB = {
  "hjk9h": {
    id: "hjk9h",
    email: "chrondCK@hotmail.com",
    password: "purple-monkey-dinosaur"
  },
  "kihd9": {
    id: "kihd9",
    email: "chrochochoco@gmail.com",
    password: "dishwasher-funk"
  },
  "njaksl": {
    id: "njaksl",
    email: "mmm@mmm.com",
    password: "mmm"
  }
};

//// #MIDDLEWARE ////

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
  res.locals = {
    user: usersDB[req.cookies["userID"]]
  };
  next();
});


//// #HELPER FUNCTIONS
getRandomString = function()  {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length ));
  }
  return text;
};

//// #HOME ////
app.get('/', (req, res) => {
  res.redirect('/urls/');
});

//// #EASTER EGG ////

app.get('/hello', (req, res) => {
  res.end('<a href="http://heeeeeeeey.com/">Hello</a>');
});

//// #URLS ////

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let randStr = getRandomString();
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(`/urls/${randStr}`);
});

//// #NEW URLS ////

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//// #ID ////

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});

app.post('/urls/:id/delete', (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url === undefined) {
    res.status(404).send(`Cannot delete ${url}`);
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

//// #USER LOGIN/OUT ////

app.get('/login', (res, req) => {
  req.render('urls_login');
});

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



app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password || emailPassMatch(req.body.email) !== req.body.password) {
    res.status(403).send('Please enter a valid email/password');
  } else {
    let userInfo = userLookup(req.body.email);
    res.cookie('userID', userInfo.id);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls/');
});

//// #PORT LISTEN ////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//// #USER REGISTRATION ////

app.get('/register', (req, res) => {
  res.render('urls_register');
});

function emailExist(formEmail) {
  for (let item in usersDB) {
    if (usersDB[item].email === formEmail) {
      return true;
    }
  }
  return false;
}

app.post('/register', (req, res) => {
  const randUser = getRandomString();
  const email = req.body.email;
  const password = req.body.password;
  let userID = usersDB.userID;
  if (!email || !password) {
    res.status(400).send('Please enter a valid email/password');
  } else if (emailExist(req.body.email)) {
    res.status(400).send('That email address is already registered, please try again');
  } else {
    usersDB[randUser] = {
      id: randUser,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('userID', randUser);
    res.redirect('/urls/');
  }
});