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

function wrap_optional_parameters(endpoint, dataset, req, res) {
  var crime_type;
  if (req.query.crime_type) {
    crime_type = req.query.crime_type
  } else {

  }
  if (req.query.date_start) {
    var date_start = new Date(req.query.date_start);
    var date_end = req.query.date_end ? new Date(req.query.date_end) : date_end = new Date();

    endpoint(date_start, date_end)
    .then(result => {
      res.json(result)
    })
  } else {
    res.json(dataset);
  }
}

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
    const bounding_box = {
      NE: req.query.ne.split(','),
      SW: req.query.sw.split(',')
    }

    var date_start, date_end, crime_type;
    if (req.query.startDate) {
      date_start = new Date(req.query.start_date)
    }

    if (req.query.endDate) {
      date_end = new Date(req.query.end_date)
    }

    if(req.query.crimeType === 'All') {
      crime_type = null;
    } else {
      crime_type = req.query.crimeType;
    }

    crimesController.getCrimesWithinArea(bounding_box, date_start, date_end, crime_type)
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

  app.get('/api/crimes/regions', (req, res) => {
    res.json(crimesController.getRegions());
  });

  app.get('/api/crimes/types', (req, res) => {
    res.json(crimesController.getCrimeTypes());
  });

  app.get('/api/crimes/outcomes', (req, res) => {
    res.json(crimesController.getOutcomes());
  });

  app.get('/api/crimes/stats/:type', (req, res) => {
    switch(req.params.type) {
      case 'crime-outcomes':
        wrap_optional_parameters(
          crimesController.getCrimesWithAnOutcome,
          crimesController.getStats().outcomesByHas,
          req, res
        )
        break;
      case 'outcomes-by-region':
        wrap_optional_parameters(
          crimesController.getRegionsWithOutcomes,
          crimesController.getStats().outcomesByRegion,
          req, res
        )
        res.json(crimesController.getStats().outcomesByRegion);
        break;
      case 'outcome-ratio':
        res.json(crimesController.getStats().outcomeRatio);
        break;
      case 'crimes-by-type':
        res.json(crimesController.getStats().crimesByType);
        break;
      case 'crimes-by-region':
        res.json(crimesController.getStats().crimesByRegion);
        break;
      case 'crimes-by-month':
        res.json(crimesController.getStats().crimesByMonth);
        break;
      case 'all':
        res.json(crimesController.getStats());
        break;
    }
  });
}

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(config.server.https_port, config.server.host)
