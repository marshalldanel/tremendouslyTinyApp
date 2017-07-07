const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

//////
//// #URL DATABASE ////
//////

var urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouse.cs',
    user: "hjk9h"
  },
  '9sm5xk': {
    longURL: 'http://www.google.com',
    user: "kihd9"
  }
};

//////
//// #USER DATABASE ////
//////

var usersDB = {
  "hjk9h": {
    id: "hjk9h",
    email: "van@hotmail.com",
    password: "purple-monkey-dinosaur"
  },
  "kihd9": {
    id: "kihd9",
    email: "van@gmail.com",
    password: "dishwasher-funk"
  },
  "njaksl": {
    id: "njaksl",
    email: "mmm@mmm.com",
    password: "mmm"
  }
};

//////
//// #MIDDLEWARE ////
//////

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
  res.locals = {
    user: usersDB[req.cookies["userID"]]
  };
  next();
});



//////
//// #HELPER FUNCTIONS ////
//////

getRandomString = function()  {
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
  for (let item in usersDB) {
    if (usersDB[item].email === formEmail) {
      return true;
    }
  }
  return false;
}

//////
//// #HOME ////
//////

app.get('/', (req, res) => {
  res.redirect('/urls/');
});

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
  if (!req.cookies["userID"]) {
    res.redirect('/login');
  } else {
  const newUserUrls = urlsForUser(req.cookies["userID"]);
  const templateVars = { urls: newUserUrls};
  res.render('urls_index', templateVars);
  }
});

// app.get('/urls', (req, res) => {
  
//     const newUserUrls = urlsForUser(req.cookies["userID"].id);
//     const templateVars = { urls: newUserUrls };
//     res.render('urls_index', templateVars);
//   }
// });

/////////
app.post('/urls', (req, res) => {
  let randStr = getRandomString();
  let user = usersDB[req.cookies["userID"]];
  urlDatabase[randStr] = {
    longURL: req.body.longURL,
    user: usersDB[req.cookies["userID"]].id
  };
  res.redirect(`/urls/${randStr}`);
});
/////

app.post('urls/new', (req, res) => {
  const shortURL = req.params.id;
  usersDB.id[req.params.id] = req.body.longURL;
});

//////
//// #NEW ////
/////

app.get('/urls/new', (req, res) => {
  if (!usersDB[req.cookies["userID"]]) {
    res.redirect('/login');
  } else {
    res.render('urls_new');
  }
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//////
//// #ID ////
//////

app.get('/urls/:id', (req, res) => {
  if (!usersDB[req.cookies["userID"]]) {
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
  urlDatabase[req.params.id] = {longURL: req.body.longURL, user: usersDB[req.cookies["userID"]].id};
  res.redirect('/urls/');
});

// delete
app.post('/urls/:id/delete', (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!usersDB[req.cookies["userID"]] || url === undefined) {
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

app.get('/login', (res, req) => {
  req.render('urls_login');
});

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