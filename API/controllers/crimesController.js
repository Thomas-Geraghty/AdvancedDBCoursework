const mongodb = require('../data/mongodb')

var crimeTypes = [];
var regions = [];
var outcomes = []

function intialize() {
    return new Promise((resolve) => {
        mongodb.intialize()
        .then(() => {
            mongodb.getDistinct('crimes', { query: "crime_type" })
            .then(result => {
                crimeTypes = result;
                resolve();
            });
            mongodb.getDistinct('crimes', { query: "falls_within" })
            .then(result => {
                regions = result;
                resolve();
            });
            mongodb.getDistinct('crimes', { query: "last_outcome_category" })
            .then(result => {
                outcomes = result;
                resolve();
            });
        });
    })
}

function getCrimeTypes() {
    return crimeTypes;
}

function getRegions() {
    return regions;
}

function getOutcomes() {
    return outcomes;
}

function getCrimes(index, limit) {
    return mongodb.getRecords('crimes', { index: index, limit: limit });
}

function getCrimesNearby(location, distance) {
    const query = {
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [location.lon, location.lat]
                },
                $maxDistance: distance
            }
        }
    }

    return mongodb.getRecords('crimes', { query: query });
}

function getCrimesByType(type) {
    return mongodb.getRecords('crimes', { query: { crime_type: type } });
}

function getCrimesByRegion(region, index, limit) {
    return mongodb.getRecords('crimes', { query: { crime_type: region }, index: index, limit: limit });
}

function getSearchResults(query) {
    return mongodb.getRecords('crimes', { query: { $text: { $search: query } } });
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
    getOutcomes: getOutcomes,

    getCrimes: getCrimes,
    getCrimesNearby: getCrimesNearby,
    getCrimesByType: getCrimesByType,
    getCrimesByRegion: getCrimesByRegion,
    getSearchResults: getSearchResults,
    getHeatmap: getHeatmap
}
