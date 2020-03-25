var postgres = require('../data/postgres');
var bus = require('./bus_controller');
var rail = require('./rail_controller');
var stops = new Map();


function getStop(atco, advanced) {
    type = getType(atco);
    switch (type) {
        case 'bus':
            return new Promise((resolve) => {
                if (advanced) {
                    bus.getStopAdvanced(atco).then((result) => {
                        resolve(result);
                    })
                } else {
                    bus.getStopSimple(atco).then((result) => {
                        resolve(result);
                    })
                }
            })
        case 'rail':
            return new Promise((resolve) => {
                rail.getStopSimple(atco).then((result) => {
                    resolve(result);
                })
            })
    }
}

function getNearbyStops(coords, max_distance) {
    coords = {lat: parseFloat(coords.lat), lon: parseFloat(coords.lon)}
    function distanceCalc(point1, point2) {
        var p = 0.017453292519943295;
        var a = 0.5 - Math.cos((point2['lat'] - point1['lat']) * p) / 2
            + Math.cos(point1['lat'] * p) * Math.cos(point2['lat'] * p)
            * (1 - Math.cos((point2['lon'] - point1['lon']) * p)) / 2;

        return 12742 * Math.asin(Math.sqrt(a)) * 1000;
    }

    var atcos = [];
    const offset = (max_distance * 0.000009);
    const Min = { y: coords.lat - offset, x: coords.lon - (offset * 2) };
    const Max = { y: coords.lat + offset, x: coords.lon + (offset * 2) };

    stops.forEach((value, key) => {
        var p = { x: value.lon, y: value.lat }
        if (Min.x <= p.x && Max.x >= p.x && Min.y <= p.y && Max.y >= p.y) {
            var distance = distanceCalc(coords, value);
            if(distance < max_distance) {
                atcos.push({atco: key, distance: distance});
            }
        }
    })

    atcos.sort((a, b) => {
        return a.distance - b.distance;
    });

    atcos = atcos.map(element => element.atco)
    var query = {
        text:  `SELECT * FROM 
                (
                    SELECT 'bus' as type, atco, name, latitude as lat, longitude as lon FROM naptan_bus_stops WHERE active = true
                    UNION 
                    SELECT 'rail' as type, atco, name, latitude as lat, longitude as lon FROM naptan_rail_stops
                )
                AS merged
                WHERE merged.atco = ANY($1)`,
        values: [atcos]
    }

    return postgres.query(query)
}

function getStops(type, index, advanced) {
    var length = 25;
    var atcos = []
    for (entry of stops.entries()) {
        if (entry[1].type == type) {
            atcos.push(entry[0]);
        }
    }

    var promises = []
    for (i = (length * index); i < (length * index + length); i++) {
        promises.push(
            getStop(atcos[i], advanced)
        )
    }

    return new Promise((resolve) => {
        Promise.all(promises).then((results) => {
            resolve(results);
        })
    })
}

function getService(type, lineID, direction) {
    switch (type) {
        case 'bus':
            return new Promise((resolve) => {
                bus.getService(lineID, direction).then((result) => {
                    resolve(result);
                })
            })
    }
}

function getStopServices(atco) {
    switch (getType(atco)) {
        case 'bus':
            return bus.getStopServices(atco);
    }
}

function intialize() {
    return new Promise((resolve) => {
        postgres.connectToDB.then(() => {
            var promises = [
                new Promise((resolve) => {
                    var query = {
                        text:  `SELECT atco, latitude, longitude
                                FROM naptan_bus_stops`
                    }
                    postgres.query(query).then((records) => {
                        records.rows.forEach((element) => {
                            stops.set(element.atco,
                                {
                                    type: 'bus',
                                    lat: element.latitude,
                                    lon: element.longitude
                                }
                            )
                        })
                        resolve();
                    })
                }),
                new Promise((resolve) => {
                    var query = {
                        text:  `SELECT atco, latitude, longitude 
                                FROM naptan_rail_stops`
                    }
                    postgres.query(query).then((records) => {
                        records.rows.forEach((element) => {
                            stops.set(element.atco,
                                {
                                    type: 'rail',
                                    lat: element.latitude,
                                    lng: element.longitude
                                }
                            )
                        })
                        resolve();
                    })
                })
            ]
            Promise.all(promises).then(() => {
                resolve();
            })
        })
    })
}

function getType(atco) {
    return stops.get(atco).type;
}

module.exports = {
    intialize: intialize,

    getType: getType,

    getStop: getStop,

    getStops: getStops,

    getNearbyStops: getNearbyStops,

    getService: getService,

    getStopServices: getStopServices
}