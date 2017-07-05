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

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('OK');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
