const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey = fs.readFileSync('cert/selfsigned.key', 'utf-8')
const certificate = fs.readFileSync('cert/selfsigned.crt', 'utf-8')
const credentials = { key: privateKey, cert: certificate }

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
    var date;
    if (req.query.date) {
      date = new Date(req.query.date)
    } else {
      date = new Date()
      date.setMonth(date.getMonth() - 3)
    }

    crimesController.getCrimesNearby(location, distance, date)
    .then(result => {
      res.json(result);
    })
  });

  app.get('/api/crimes/within-area', (req, res) => {
    const boundingBox = {
      NE: req.query.ne.split(','),
      SW: req.query.sw.split(',')
    }
    var date;
    if (req.query.date) {
      date = new Date(req.query.date)
    } else {
      date = new Date()
      date.setMonth(date.getMonth() - 3)
    }

    crimesController.getCrimesWithinArea(boundingBox, date)
    .then(result => {
      var min = 1000;
      var max = 0;

      result.forEach(point => {
        count = point.count
        if (count < min) {
          min = count;
        }
        if (count > max) {
          max = count
        }
      })

      result.map(p => {
        p.distribution_point = (min / max) * p.count * 100
        return p
      })

      res.json(result);
    })
  });

  app.get('/api/crimes/with-outcomes', (req, res) => {
    crimesController.getCrimesWithAnOutcome()
    .then(result => {
      res.json(result)
    });
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

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(config.server.https_port, config.server.host)