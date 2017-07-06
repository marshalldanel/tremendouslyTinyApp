const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helperFuncs = require('./helper_funcs');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

//// #MIDDLEWARE ////

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
  res.locals = {
    username: req.cookies["username"]
  };
  next();
});

//// #DATABASE ////

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouse.cs',
  '9sm5xk': 'http://www.google.com'
};

//// #EASTER EGG ////

app.get('/hello', (req, res) => {
  res.end('<a href="http://heeeeeeeey.com/">Hello</a>');
});

//// #URLS ////

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const randStr = helperFuncs;
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

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

//// #PORT LISTEN ////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});