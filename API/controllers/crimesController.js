const mongodb = require('../data/mongodb')

var crimeTypes = [
    "Anti-social behaviour", "Bicycle theft", "Burglary", "Criminal damage and arson",
    "Drugs", "Other crime", "Other theft", "Possession of weapons", "Public order", 
    "Robbery", "Shoplifting", "Theft from the person", "Vehicle crime",
];
var regions = [
    "Avon and Somerset Constabulary", "Bedfordshire Police", "British Transport Police",
    "Cambridgeshire Constabulary", "Cheshire Constabulary", "City of London Police",
    "Cleveland Police", "Cumbria Constabulary", "Derbyshire Constabulary",
    "Devon & Cornwall Police", "Dorset Police", "Durham Constabulary",
    "Dyfed-Powys Police", "Essex Police", "Gloucestershire Constabulary",
    "Greater Manchester Police", "Gwent Police", "Hampshire Constabulary",
    "Hertfordshire Constabulary", "Humberside Police", "Kent Police",
    "Lancashire Constabulary", "Leicestershire Police", "Lincolnshire Police",
    "Merseyside Police", "Metropolitan Police Service", "Norfolk Constabulary",
    "North Wales Police", "North Yorkshire Police", "Northamptonshire Police",
    "Northumbria Police", "Nottinghamshire Police", "Police Service of Northern Ireland",
    "South Wales Police", "South Yorkshire Police", "Staffordshire Police",
    "Suffolk Constabulary", "Surrey Police", "Sussex Police",
    "Thames Valley Police", "Warwickshire Police", "West Mercia Police",
    "West Midlands Police", "West Yorkshire Police", "Wiltshire Police"
];
var outcomes = [];

function intialize() {
    return new Promise((resolve) => {
        mongodb.intialize()
        .then(() => {
            var promises = [
                new Promise((resolve) => {
                    mongodb.getDistinct('crimes', { query: "crime_type", fields: { crime_type: 1 } })
                    .then(result => {
                        console.log(result)
                        crimeTypes = result;
                        resolve();
                    });
                }),

                new Promise((resolve) => {
                    mongodb.getDistinct('crimes', { query: "falls_within", fields: { falls_within: 1 } })
                    .then(result => {
                        console.log(result)
                        regions = result;
                        resolve();
                    });
                }),

                new Promise((resolve) => {
                    mongodb.getDistinct('crimes', { query: "last_outcome_category", fields: { last_outcome_category: 1 } })
                    .then(result => {
                        console.log(result)
                        outcomes = result;
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
