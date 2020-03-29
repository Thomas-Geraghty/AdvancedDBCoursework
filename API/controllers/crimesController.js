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
var outcomes = [
    "Investigation complete; no suspect identified", "", "Status update unavailable",
    "Further investigation is not in the public interest", "Offender given a caution",
    "Unable to prosecute suspect", "Offender given a drugs possession warning",
    "Court result unavailable", "Court case unable to proceed",
    "Offender given community sentence", "Offender given suspended prison sentence",
    "Formal action is not in the public interest", "Local resolution",
    "Offender given conditional discharge", "Offender sent to prison",
    "Offender ordered to pay compensation", "Offender given penalty notice",
    "Offender fined", "Awaiting court outcome", "Suspect charged as part of another case",
    "Defendant found not guilty", "Action to be taken by another organisation",
    "Offender otherwise dealt with", "Offender deprived of property",
    "Defendant sent to Crown Court", "Offender given absolute discharge",
    "Further action is not in the public interest", "Under investigation"
];

function intialize() {
    return new Promise((resolve) => {
        mongodb.intialize()
        .then(() => {
            /*
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
            */
           resolve();
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

    return mongodb.getRecords('crimes', { query: query, limit: 1000 });
}

function getCrimesNearby2(location, distance, date) {
    const aggregation =
        [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [ location.lon, location.lat ] },
                    distanceField: "distance",
                    maxDistance: distance
                }
            },
            {
                $project: {
                    date: { $toDate: { $dateFromString: { dateString: "$month" } } },
                    location: 1, last_outcome_category: 1, falls_within: 1, street_name: 1, crime_type: 1
                }
            },
            {
                $match: {
                    date: {
                        $gte: date,
                        $lt: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: "$location",
                    count: { $sum: 1 }
                }
            }
         ]

    return mongodb.getAggregate('crimes', aggregation);
}

function getCrimesWithinArea(location, boundingBox, date) {
    // boundingBox = [ latitude, longitude ]
    var height = Math.abs(parseFloat(boundingBox.NE[0]) - parseFloat(boundingBox.SW[0]))
    var width = Math.abs(parseFloat(boundingBox.NE[1]) - parseFloat(boundingBox.SW[1]))

    var height_meters = height * 111320
    var width_meters = width * ((4007500 * Math.cos(height * (Math.PI / 180))) / (2 * Math.PI))

    var radius = Math.min(height_meters, width_meters) / 2

    const aggregation =
        [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [ location.lon, location.lat ] },
                    distanceField: "distance",
                    maxDistance: radius
                }
            },
            {
                $project: {
                    date: { $toDate: { $dateFromString: { dateString: "$month" } } },
                    location: 1, last_outcome_category: 1, falls_within: 1, street_name: 1, crime_type: 1
                }
            },
            {
                $match: {
                    date: {
                        $gte: date,
                        $lt: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: "$location",
                    count: { $sum: 1 }
                }
            }
         ]

    return mongodb.getAggregate('crimes', aggregation);
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
    getCrimesNearby2: getCrimesNearby2,
    getCrimesByType: getCrimesByType,
    getCrimesByRegion: getCrimesByRegion,
    getSearchResults: getSearchResults,
    getHeatmap: getHeatmap
}
