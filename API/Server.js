const express = require('express');
const cors = require('cors');
const app = express();
const config = require('../config');
const crimesController = require('./controllers/crimesController')
app.use(cors());
app.options('*', cors());
app.set('json spaces', 4)

crimesController.intialize.then(() => { routes() });

function routes() {
  app.get('/API/Crimes', (req, res) => {
    const index = req.query.index;
    const limit = req.query.limit

    res.json(crimesController.getCrimes(index, limit));
  });

  app.get('/API/Crimes/:id', (req, res) => {
    const id = req.params.id;

    res.json(crimesController.getCrime(id));
  });
}

var server = app.listen(config.server.port, config.server.host, () => {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})