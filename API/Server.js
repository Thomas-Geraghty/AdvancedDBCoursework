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
      lat: parseFloat(req.query.lat),
      lon: parseFloat(req.query.lon)
    }
    const distance = parseFloat(req.query.dist);

    crimesController.getCrimesNearby2(location, distance)
    .then(result => {
      res.json(result);
    })
  });

  app.get('/api/crimes/nearby-within', (req, res) => {
    const location = {
      lat: parseFloat(req.query.lat),
      lon: parseFloat(req.query.lon)
    }
    const distance = parseFloat(req.query.dist);
    var date;
    if (req.query.date) {
      date = new Date(req.query.date)
    } else {
      date = new Date()
      date.setMonth(date.getMonth() - 3)
    }

    console.log(date)

    crimesController.getCrimesNearbyWithinDate(location, distance, date)
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
    res.json(crimesController.getRegions());
  });

  app.get('/api/crimes/types', (req, res) => {
    res.json(crimesController.getCrimeTypes());
  });

  app.get('/api/crimes/outcomes', (req, res) => {
    res.json(crimesController.getOutcomes());
  });
}

var server = app.listen(config.server.port, config.server.host, () => {
  var host = server.address().address
  var port = server.address().port
})
