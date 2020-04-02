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

/**
 * Takes an object specifiying required parameters. Throws an error with all
 * invalid keys if any
 */
function required_params(params) {
  errors = []
  values = {}
  for (param in params) {
    var value = params[param]
    if (!value) {
      errors.push(param + " is required.")
    } else {
      values[param] = value
    }
  }
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(' ') }
  }
  return values
}

/**
 * Takes an object specifiying validation rules. Throws an error with all
 * invalid values, if any. Object has the following struture:
 * {
 *   field: {
 *     value: field,
 *     rules: { min: -90, max: 90 }
 *   }
 * }
 */
function validate_params(params) {
  errors = []
  for (param in params) {
    var value = params[param].value
    var rules = params[param].rules
    for (type in rules) {
      var val
      switch (type) {
        case "min":
          val = parseFloat(value)
          if (val < rules[type]) {
            errors.push(param + " must be at least " + rules[type] + ".")
          }
          break;
        case "max":
          val = parseFloat(value)
          if (val > rules[type]) {
            errors.push(param + " must be at most " + rules[type] + ".")
          }
          break;
        case "min_len":
          if (value.length < rules[type]) {
            errors.push(param + " length must be at least " + rules[type] + ".")
          }
          break;
        case "ne":
          if (value == rules[type]) {
            errors.push(param + " must not be " + rules[type] + ".")
          }
          break;
      }
    }
  }
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(' ') }
  }
}

/**
 * Takes an object specifiying parameters and a callback function. Returns an
 * object with the same keys and values after being called back
 */
function format_params(params, callback) {
  values = {}
  for (param in params) {
    values[param] = callback(params[param])
  }
  return values
}

/**
 * Create API routes, post initialization
 * Check swagger.yaml for more info on these.
 */
function routes() {
  app.get('/api/crimes', (req, res) => {
    let index;
    if (req.query.index) {
      index = Math.max(0, parseInt(req.query.index));
    } else {
      index = 0
    }

    let limit;
    if (req.query.limit) {
      limit = Math.max(1, parseInt(req.query.limit));
    } else {
      limit = 50
    }

    crimesController.getCrimes(index, limit).then(result => {
      res.json(result);
    });
  });

  app.get('/api/crimes/nearby', (req, res) => {
    var { lat, lon, dist } = required_params({
      lat: req.query.lat,
      lon: req.query.lon,
      dist: req.query.dist
    })

    validate_params({
      lat: { value: lat, rules: { min: -90, max: 90 } },
      lon: { value: lon, rules: { min: -180, max: 180 } },
      dist: { value: dist, rules: { min: 1 } }
    })

    var { lat, lon, dist } = format_params({
      lat: lat, lon: lon, dist: dist
    }, parseFloat)

    const location = { lat: lat, lon: lon }

    var date;
    if (req.query.date) {
      date = new Date(req.query.date)
    } else {
      date = new Date()
      date.setMonth(date.getMonth() - 6)
    }

    crimesController.getCrimesNearby(location, dist, date)
    .then(result => {
      res.json(result);
    })
  });

  app.get('/api/crimes/within-area', (req, res) => {
    var { ne, sw, startDate, endDate, crimeType } = required_params({
      ne: req.query.ne,
      sw: req.query.sw,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      crimeType: req.query.crimeType
    })

    ne = ne.split(',')
    sw = sw.split(',')

    validate_params({
      ne: { value: ne, rules: { min_len: 2 } },
      sw: { value: sw, rules: { min_len: 2 } }
    })

    var { ne_lat, ne_lon, sw_lat, sw_lon } = format_params({
      ne_lat: ne[0], ne_lon: ne[1], sw_lat: sw[0], sw_lon: sw[1]
    }, parseFloat)

    validate_params({
      ne_lat: { value: ne_lat, rules: { min: -90, max: 90, ne: 0} },
      ne_lon: { value: ne_lon, rules: { min: -180, max: 180, ne: 0} },
      sw_lat: { value: sw_lat, rules: { min: -90, max: 90, ne: 0} },
      sw_lon: { value: sw_lon, rules: { min: -180, max: 180, ne: 0} }
    })

    bounding_box = {
      NE: [ ne_lat, ne_lon ],
      SW: [ sw_lat, sw_lon ]
    }

    startDate = new Date(startDate)
    endDate = new Date(endDate)
    crimeType = crimeType === 'All' ? null : crimeType

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

  app.use(() => {
    throw { status: 404, message: 'This API endpoint does not exist.' }
  })

  app.use((err, req, res, next) => {
    let httpStatus;
    switch(err.status) {
      case 400:
        httpStatus = 'Bad Request';
        break;
      case 404:
        httpStatus = 'Not Found'
        break;
      case 500:
        httpStatus = 'Internal Server Error'
        break;
      case undefined:
        httpStatus = 'Internal Server Error'
        err.status = 500
        break;
    }

    const errorObj = {
      "ApiError": {
        "ExceptionType": "ApiArgumentException",
        "HttpStatus": httpStatus,
        "HttpStatusCode": err.status,
        "Message": err.message,
        "RelativeUri": req.path,
        "TimestampUtc": Date.now()
      }
    };
    res.status(err.status)
    res.json(errorObj);
  });
}

var httpsServer = https.createServer(credentials, app)
httpsServer.listen(config.server.https_port, config.server.host)
