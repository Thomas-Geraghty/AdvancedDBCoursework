const mongodb = require('../data/mongodb')

var crimeTypes = [];
var regions = [];

function intialize() {
    return new Promise(resolve, () => {
        mongodb.intialize()
        .then(() => {
            var promises = [
                new Promise(resolve, () => {
                    mongodb.getDistinct('PoliceData', { query: { CrimeType: '*' }, fields: { CrimeType: 1 } })
                    .then(result => {
                        crimeTypes = result;
                        resolve();
                    });
                }),
                new Promise(resolve, () => {
                    mongodb.getDistinct('PoliceData', { query: { FallsWithin: '*' }, fields: { FallsWithin: 1 } })
                    .then(result => {
                        regions = result;
                        resolve();
                    });
                })
            ]

            Promise.all(promises).then(() => {
                resolve();
            })
        });
    })
}

function getCrimeTypes() {
    return crimeTypes;
}

function getRegions() {
    return regions;
}

function getCrime(id) {
    return mongodb.getRecords('PoliceData', { query: { CrimeId: id } });
}

function getCrimes(index, limit) {
    return mongodb.getRecords('PoliceData', { index: index, limit: limit });
}

function getCrimesNearby(location, distance) {
    const query = {
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [location.lat, location.lon]
                },
                $maxDistance: distance
            }
        }
    }

    return mongodb.getRecords('PoliceData', { query: query });
}

function getCrimesByType(type) {
    return mongodb.getRecords('PoliceData', { query: { CrimeType: type } });
}

function getCrimesByRegion(region, index, limit) {
    return mongodb.getRecords('PoliceData', { query: { CrimeType: region }, index: index, limit: limit });
}


module.exports = {
    intialize: intialize,
    getCrimeTypes: getCrimeTypes,
    getRegions: getRegions,
    
    getCrime: getCrime,
    getCrimes: getCrimes,
    getCrimesNearby: getCrimesNearby,
    getCrimesByType: getCrimesByType,
    getCrimesByRegion: getCrimesByRegion
}