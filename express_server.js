const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouse.cs',
  '9sm5xk': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length ));
  }
  return text;
}

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post('/urls', (req, res) => {
  const randStr = generateRandomString();
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(`/urls/${randStr}`);
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

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});
