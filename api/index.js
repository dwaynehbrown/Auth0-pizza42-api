const app = require('express')()
const { v4 } = require('uuid')


const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const axios = require("axios");

app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`)
})

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params
  res.end(`Item: ${slug}`)
})


const cors = require('../conf/cors');
app.use(cors);

const authConfig = {
  "domain": "db-test.eu.auth0.com",
  "clientId": "sfszpobK3d1s4TljE5yB36SCIusSEbUb",
  "audience": "pizza-42-express"
};

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: 'pizza-42-express',
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });

});

// create order
app.post("/api/order", checkJwt, (req, res) => {

  if (req.user.scope.indexOf('order:order') > -1) {
    if (req.user["http://pizza42/email_verified"]) {

      let order = {
        timestamp: new Date().valueOf(),
        orderId: Math.random().toString(36).substr(2, 9)
      }

      res.send({ order: { ...order }, user: { a: 'b', ...req.user } });
    } else {

      res.send({ err: 'please verify email', user: { a: 'b', ...req.user } });
    }
  } else {
    res.send({ err: 'required scope not granted' })
  }

});



// create order
app.post("/api/updateUser", checkJwt, (req, res) => {


  // return res.send(req.user);

  if (req.user.scope.indexOf('update:account') > -1) {

    var request = require("request");

    var options = {
      method: 'POST',
      url: 'https://db-test.eu.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      body: '{"client_id":"8WJpcieAknIeViXj9nen6Rl3Hgxwd02v","client_secret":"n-dTKYeNr3jqubT92B2b-AT6y-VbQ4oYmwaSinHEcV_TSUSwxUN_PuA2NT9pOUHP","audience":"https://db-test.eu.auth0.com/api/v2/","grant_type":"client_credentials"}'
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);



      let updateOptions = {
        method: 'POST',
        url: 'https://db-test.eu.auth0.com/api/v2/users/' + req.user.sub,
        headers: { 'content-type': 'application/json', "Authorization": body.accessToken },
        body: '{user_metadata: {isTest: true }}'
      };


      request(updateOptions, function (error, response, updateResp) {
        if (error) throw new Error(error);

        res.send({
          update: updateResp,
          user: req.user,
          acces: body

        });

      });


    })

  }

})

module.exports = app