const mongodb = require('../data/mongodb')

var crimeTypes = [];

function intialize() {
    return new Promise(resolve, () => {
        mongodb.intialize()
        .then(() => {
            mongodb.getDistinct('PoliceData', { CrimeType: '*' })
            .then(result => {
                crimeTypes = result;
                resolve();
            });
        });
    })
}

function getCrime(id) {
    return mongodb.getRecords('PoliceData', { query: { CrimeId: id } });
}

function getCrimes(index, limit) {
    return mongodb.getRecords('PoliceData', { index: index, limit: limit });
}

function getCrimesByRegion(region, index, limit) {
    return mongodb.getRecords('PoliceData', { query: { CrimeType: region }, index: index, limit: limit });
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

module.exports = {
    intialize: intialize,
    getCrime: getCrime,
    getCrimes: getCrimes,
    getCrimesNearby: getCrimesNearby,
    getCrimesByRegion: getCrimesByRegion
}