const express = require('express');
const cors = require('cors');
var app = express();
var data = require('./controllers/data_controller')
var env = process.env.NODE_ENV || 'development';
global.__config = require('./config')[env];
app.use(cors());
app.options('*', cors());
app.set('json spaces', 4)

data.intialize().then(() => {
  routes();
})

function routes() {
  app.get('/API/Stops', (req, res) => {
    var coords = { lat: req.query.lat, lon: req.query.lon }
    var distance = req.query.dist;
    data.getNearbyStops(coords, distance).then(result => {
      res.json(result.rows);
    })
  });

  app.get('/API/Stops/:atco', (req, res) => {
    var advanced = false;
    if (req.query.adv == "true") {
      advanced = true;
    }
    data.getStop(req.params.atco, advanced).then((result) => {
      res.json(result);
    })
  });

  app.get('/API/Stops/type/:type', (req, res) => {
    var advanced = false;
    if (req.query.adv == "true") {
      advanced = true;
    }
    data.getStops(req.params.type, req.query.ind, advanced).then((result) => {
      res.json(result);
    })
  });

  app.get('/API/Services/Line/:id/Routes', (req, res) => {
    data.getServiceRoutes(req.params.id).then((result) => {
      res.json(result);
    })
  }),

  app.get('/API/Services/StopPoint/:atco/Routes', (req, res) => {
    data.getStopServices(req.params.atco).then((result) => {
      res.json(result);
    })
  })
}

var server = app.listen(__config.server.port, __config.server.host, () => {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})