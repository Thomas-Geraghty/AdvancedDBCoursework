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
    return mongodb.getRecords('PoliceData', { query: { Crimeid: id } });
}

function getCrimes(index, limit) {
    return mongodb.getRecords('PoliceData', { index: index, limit: limit });
}

module.exports = {
    intialize: intialize,
    getCrime: getCrime,
    getCrimes: getCrimes
}