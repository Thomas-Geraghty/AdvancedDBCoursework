const fs = require('fs')
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

// Used for extra stats queries, wraps all the optional parameters and returns
// the original dataset if none are supplied
function wrap_optional_parameters(endpoint, dataset, req, res) {
  var crime_type = null;
  if (req.query.crime_type) {
    crime_type = req.query.crime_type
  }

  if (req.query.date_start) {
    var date_start = new Date(req.query.date_start);
    var date_end = req.query.date_end ? new Date(req.query.date_end) : date_end = new Date();

    endpoint(date_start, date_end, crime_type)
    .then(result => {
      res.json(result)
    })
  } else {
    res.json(dataset);
  }
}

// Create API routes, post initialization
function routes() {
  app.get('/api/crimes', (req, res) => {
    var index;
    if (req.query.index) {
      index = parseInt(req.query.index)
    } else {
      index = 0
    }

    index = Math.max(0, index)

    var limit;
    if (req.query.limit) {
      limit = parseInt(req.query.limit)
    } else {
      limit = 50
    }

    limit = Math.max(1, limit)

    crimesController.getCrimes(index, limit).then(result => {
      res.json(result);
    });
  });

  app.get('/api/crimes/nearby', (req, res) => {
    var lat = parseFloat(req.query.lat)
    var lon = parseFloat(req.query.lon)

    if ((lat < -90) || (lat > 90)) {
      return res.json({error: "Latitude must be in the range -90 - 90"})
    }

    if ((lon < -180) || (lon > 180)) {
      return res.json({error: "Longitude must be in the range -180 - 180"})
    }

    const location = {
      lat: lat,
      lon: lon
    }

    const distance = parseFloat(req.query.dist);

    if (distance < 0) {
      return res.json({error: "Distance cannot be negative"})
    }

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
    var ne = req.query.ne.split(',')
    var sw = req.query.sw.split(',')

    bounding_box = {
      NE: [ parseFloat(ne[0]), parseFloat(ne[1])],
      SW: [ parseFloat(sw[0]), parseFloat(sw[1])]
    }

    if ((bounding_box.NE[0] < -90) || (bounding_box.NE[0] > 90)) {
      return res.json({error: "NE latitude must be in the range -90 - 90"})
    }

    if ((bounding_box.SW[0] < -90) || (bounding_box.SW[0] > 90)) {
      return res.json({error: "SW latitude must be in the range -90 - 90"})
    }

    if ((bounding_box.NE[1] < -180) || (bounding_box.NE[1] > 180)) {
      return res.json({error: "NE longitude must be in the range -180 - 180"})
    }

    if ((bounding_box.SW[1] < -180) || (bounding_box.SW[1] > 180)) {
      return res.json({error: "SW longitude must be in the range -180 - 180"})
    }

    var startDate, endDate, crimeType;
    startDate = new Date(req.query.startDate)
    endDate = new Date(req.query.endDate)
    crimeType = req.query.crimeType === 'All' ? null : req.query.crimeType

    crimesController.getCrimesWithinArea(bounding_box, startDate, endDate, crimeType)
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
