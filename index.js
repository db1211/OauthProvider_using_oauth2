require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const OAuthServer = require('oauth2-server');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'super secret key',
    saveUninitialized: true,
    resave: true
}));

app.oauth = new OAuthServer({
    model: require('./model/model.js'),
    grants: ['authorization_code'],
    debug: true
});


app.get('/auth', (req, res) => {
    console.log("Request body:", req.body);
    console.log("/auth")
   
});

// Post token endpoint
const { Request, Response } = require('oauth2-server');
// console.log

app.post('/oauth/token', (req, res, next) => {
    
    console.log("oauth token triggered")
  const request = new Request(req);
  const response = new Response(res);

  app.oauth.token(request, response)
    .then((token) => {
     
      res.json(response.body);
    })
    .catch((err) => {
      
      res.status(err.code || 500).json(err);
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
