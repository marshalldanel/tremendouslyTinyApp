var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouse.cs',
  '9sm5xk': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
