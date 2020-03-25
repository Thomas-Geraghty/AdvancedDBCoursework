var tfwm = require('../data/tfwm');
var postgres = require('../data/postgres');
var helpers = require('./Helper/Helpers')

function getStopSimple(atco) {
    return new Promise((resolve) => {
        const query = {
            text:  `SELECT * 
                    FROM naptan_bus_stops 
                    WHERE atco = '${atco}'`
        }

        postgres.query(query).then((data) => {
            data = data.rows[0];
            data.type = 'bus';
            data.indicator = indicatorClear(data.indicator);
            resolve(data)
        });
    })
}

function getStopAdvanced(atco) {
    var promises = [
        getStopSimple(atco),

        getStopServices(atco),

        new Promise((resolve) => {
            tfwm.getArrivalsByStop(atco).then((result) => {
                times = Object.values(result)[0];
                arrivals = [];
                if(times['Prediction'] != null) {
                    times['Prediction'].forEach((value) => {
                        arrivals.push({
                            id: value.LineId,
                            expectedTime:  Date.parse(value.ExpectedArrival),
                            scheduledTime: Date.parse(value.ScheduledArrival)
                        })
                    })
                }

                resolve(arrivals)
            });
        })
    ]

    return new Promise((resolve) => {
        Promise.all(promises).then((results) => {
            db_data = results[0];

            results[1].forEach(service => {
                service.arrivals = results[2].filter(arrival => arrival.id == service.id);
            })

            result = {
                atco: db_data.atco,
                type: db_data.type,
                name: db_data.name,
                indicator: db_data.indicator,
                street: db_data.street,
                localityname: db_data.localityname,
                lat: db_data.latitude,
                long: db_data.longitude,
                services: results[1],
            }

            resolve(result);
        });
    });
}

function getService(serviceID) {
    return new Promise((resolve) => {
        const query = {
            text:  `SELECT bus_lines.*, route_stops.routeid, routes.direction, 
                            route_stops.atco, stopdata.latitude, stopdata.longitude,
                            origin.localityname AS originname, destination.localityname AS destinationname,
                            route_stops.routeindex
                    FROM bus_lines
                    INNER JOIN bus_routes AS routes
                    ON bus_lines.id = routes.serviceid
                    INNER JOIN bus_route_stops AS route_stops
                    ON route_stops.routeid = routes.id
                    INNER JOIN naptan_bus_stops AS stopdata
                    ON route_stops.atco = stopdata.atco
                    INNER JOIN naptan_bus_stops AS origin
                    ON routes.originid = origin.atco
                    INNER JOIN naptan_bus_stops AS destination
                    ON routes.destinationid = destination.atco
                    WHERE routes.serviceid = ${serviceID}
                    ORDER BY routeindex`
        }
        postgres.query(query).then((results) => {
            var routeMap = new Map();

            results.rows.forEach((element) => {
                if (!routeMap.has(element.routeid)) {
                    routeMap.set(element.routeid, { 
                        routeid: element.routeid, 
                        direction: element.direction, 
                        origin: element.originname, 
                        destination: element.destinationname, 
                        routes: [] })
                }
                routeMap.get(element.routeid).routes.push({
                    atco: element.atco,
                    lat: element.latitude,
                    lon: element.longitude,
                    routeindex: element.routeindex
                })
            })

            var serviceData = results.rows[0];

            var data = {
                serviceId: serviceData.id,
                serviceName: serviceData.name,
                routes: [...routeMap.values()]
            }

            console.log(data)
            resolve(data)
        });
    })
}

function getStopServices(atco) {
    return new Promise((resolve) => {
        const query = {
            text:  `SELECT  bus_lines.*, bus_route_stops.*, bus_routes.polyline, bus_routes.direction,
                            naptan_bus_stops.latitude, naptan_bus_stops.longitude, 
                            origin.localityname AS originname, destination.localityname AS destinationname
                    FROM bus_route_stops
                    INNER JOIN naptan_bus_stops 
                    ON bus_route_stops.atco = naptan_bus_stops.atco
                    INNER JOIN bus_routes
                    ON bus_route_stops.routeid = bus_routes.id
                    INNER JOIN bus_lines
                    ON bus_routes.serviceid = bus_lines.id
                    INNER JOIN naptan_bus_stops AS origin
                    ON bus_routes.origin = origin.atco
                    INNER JOIN naptan_bus_stops AS destination
                    ON bus_routes.destination = destination.atco
                    WHERE routeid IN
                    (SELECT DISTINCT routeid
                    FROM bus_route_stops
                    WHERE bus_route_stops.atco = '${atco}')`
        }
        postgres.query(query).then((records) => {
            var routeMap = new Map();

            records.rows.forEach((record) => {
                // Sets line info (id/name) and creates map for routes.
                if (!routeMap.has(record.id)) {
                    routeMap.set(record.id, {
                        id: record.id, 
                        type: 'bus',
                        name: record.name, 
                        color: helpers.hashToInt(record.id),
                        routes: new Map(),
                        arrivals: []
                    })
                }

                // If the route isnt already in the routes list for the line, 
                // add it. Create stop array.
                if(!routeMap.get(record.id).routes.has(record.routeid)) {
                    routeMap.get(record.id).routes.set(record.routeid, {
                        id: record.routeid, 
                        origin: record.originname,
                        destination: record.destinationname,
                        direction: record.direction,
                        polyline: record.polyline,
                        stops: []
                    })
                }

                // Fill stop array with stops.
                routeMap.get(record.id).routes.get(record.routeid).stops.push({
                    atco: record.atco, 
                    lat: record.latitude, 
                    lon: record.longitude, 
                    routeindex: record.routeindex
                })
            })

            // Turn routes into just values (strip routeid keys)
            routeMap.forEach((element) => {
                element.routes = [...element.routes.values()];
            })

            // Return routemap without any keys.
            resolve([...routeMap.values()])
        });
    })
}

function indicatorClear(string) {
    var regex2 = new RegExp(`^([0-9]{1,20}|opp|adj|o\/s|o\\s|p/s|nr|near|opposite|adjacent|after|before|rear|at|no|by|to|on|end|exit|side|new|east|west|north|south).*`, 'i');
    var regex3 = new RegExp(`^(stop|stand|bay|stance) `, 'i');
    var regex4 = new RegExp(`^[a-zA-Z0-9]{1,4}$`, `i`);

    if(string.match(regex3)) {
        return `(${string.charAt(0).toUpperCase() + string.slice(1)})`;
    } else {
        if (string.match(regex2)) {
            return '';
        } else if (!string.match(regex4)) {
            return '';
        } else {
            return (`(Stop ${string})`);
        }
    }
}

module.exports = {
    getStopSimple: getStopSimple,

    getStopAdvanced: getStopAdvanced,

    getService: getService,

    getStopServices: getStopServices
}