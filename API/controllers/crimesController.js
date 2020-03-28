const mongodb = require('../data/mongodb')

var crimeTypes = [];
var regions = [];

function intialize() {
    return new Promise((resolve) => {
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

function getSearchResults(query) {
    return mongodb.getRecords('PoliceData', { query: { $text: { $search: query } } });
}

function getHeatmap(boundingBox, divisions) {
    divisions = 3;

    //MAKE REQUEST TO DB FOR INTERSECTS BETWEEN THESE
    const crimes = [];
    const crimesRegions = [];

    console.log(boundingBox)
    let length = Math.abs(boundingBox.NE[0] - boundingBox.SW[0]) / divisions;

    for(lat = boundingBox.NE[0]; lat > boundingBox.SW[0]; lat -= length) {
        for(lon = boundingBox.NE[1]; lon > boundingBox.SW[1]; lon -= length) {
            console.log(lon)
            let b = {
                boundingBox: {
                    NE: [lat + length/2, lon - length/2],
                    SW: [lat - length/2, lon + length/2]
                },
                intensity: 0
            };

            for(crime in crimes) {
                if((crime.lat > lat - length/2 && crime.lat < lat + length/2)
                && (crime.lon > lon - length/2 && crime.lon < lon + length/2)) {
                    b.intensity++;
                }
            }

            crimesRegions.push(b);
        }
    }


    return crimesRegions;
}

module.exports = {
    intialize: intialize,
    getCrimeTypes: getCrimeTypes,
    getRegions: getRegions,

    getCrime: getCrime,
    getCrimes: getCrimes,
    getCrimesNearby: getCrimesNearby,
    getCrimesByType: getCrimesByType,
    getCrimesByRegion: getCrimesByRegion,
    getSearchResults: getSearchResults,
    getHeatmap: getHeatmap
}