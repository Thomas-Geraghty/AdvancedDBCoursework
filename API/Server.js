const express = require('express');
const cors = require('cors');
const app = express();
const config = require('./config');
const crimesController = require('./controllers/crimesController')
app.use(cors());
app.options('*', cors());
app.set('json spaces', 4)

crimesController.intialize().then(() => {
  console.log('Initialized controller')
  routes()
});

function routes() {
  app.get('/api/crimes', (req, res) => {
    const index = parseInt(req.query.index)
    const limit = parseInt(req.query.limit)

    crimesController.getCrimes(index, limit).then(result => {
      res.json(result);
    });
  });

  app.get('/api/crimes/search', (req, res) => {
    const index = req.query.index;
    const limit = req.query.limit
    const searchString = req.query.search

    crimesController.getCrimes(index, limit).then(result => {
      res.json(result);
    });
  });

  app.get('/api/crimes/nearby', (req, res) => {
    const location = {
      lat: req.query.lat,
      lng: req.query.lng
    }
    const distance = req.query.dist;

    crimesController.getCrimesNearby(location, distance)
    .then(result => {
      res.json(result);
    })
  });

  app.get('/api/crimes/heatmap', (req, res) => {
    let boundingBox = {
      NE: req.query.ne.split(','),
      SW: req.query.sw.split(',')
    }

    crimesController.getHeatmap(boundingBox);
  });

  app.get('/api/crimes/regions', (req, res) => {
    res.json(crimesController.getRegions);
  });

  app.get('/api/crimes/types', (req, res) => {
    res.json(crimesController.getCrimeTypes);
  });


}

var server = app.listen(config.server.port, config.server.host, () => {
  var host = server.address().address
  var port = server.address().port
})
