const mongodb = require('../data/mongodb')

// Static crime types, generated from distinct values on the 'crime_type' field
var crimeTypes = [
    "Anti-social behaviour", "Bicycle theft", "Burglary", "Criminal damage and arson",
    "Drugs", "Other crime", "Other theft", "Possession of weapons", "Public order",
    "Robbery", "Shoplifting", "Theft from the person", "Vehicle crime",
];

// Static police regions, generated from distinct values on the 'falls_within' field
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

// Static crime outcomes, generated from distinct values on the 'last_outcome_category' field
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

// Generated once on API start
var stats;

// Initialize the controller, run and cache expensive queries
function intialize() {
    return new Promise((resolve) => {
        mongodb.intialize()
        .then(() => {
            generateStats().then(() => {
                resolve();
            });
        });
    })
}

// Return static crime types
function getCrimeTypes() {
    return crimeTypes;
}

// Return static regions
function getRegions() {
    return regions;
}

// Return static crime outcomes
function getOutcomes() {
    return outcomes;
}

// Generates the results for the stats page. Most of these are expensive, so run
// on API startup and are saved unless the requirements change
function generateStats() {

    // Get number of crimes with an outcome vs without
    function getOutcomeRatio() {
        const aggregation =
            [
                {
                    $project: {
                        outcome: {
                            $cond: { if: { $eq: [ "$last_outcome_category", "" ] }, then: "No outcome", else: "Has outcome" }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$outcome",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]

        return mongodb.getAggregate('crimes', aggregation);
    }

    // Get count of each crime type
    function getCrimesByTypeCount() {
        const aggregation = [
            {
                "$group": { _id: "$crime_type", count: { $sum: 1 } }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]
        return mongodb.getAggregate('crimes', aggregation );
    }

    // Get count of crimes per region
    function getCrimesByRegionCount() {
        const aggregation = [
            {
                $group: {
                    _id: "$falls_within",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]
        return mongodb.getAggregate('crimes', aggregation );
    }

    // Get count of crimes per month
    function getCrimesByMonthCount() {
        const aggregation = [
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]
        return mongodb.getAggregate('crimes', aggregation );
    }

    var promises = [
        getCrimesWithAnOutcome(false, false, false),
        getRegionsWithOutcomes(false, false, false),
        getCrimesByTypeCount(),
        getCrimesByRegionCount(),
        getCrimesByMonthCount(),
        getOutcomeRatio()
    ]

    return new Promise((resolve) => {
        Promise.all(promises).then(results => {
            stats = {
                outcomesByHas: results[0],
                outcomesByRegion: results[1],
                crimesByType: results[2],
                crimesByRegion: results[3],
                crimesByMonth: results[4],
                outcomeRatio: results[5]
            }
            resolve()
        })
    })
}

// Return the preloaded stats data
function getStats() {
    return stats;
}

// Get the number of crimes defined by limit, starting at index
function getCrimes(index, limit) {
    return mongodb.getRecords('crimes', { index: index, limit: limit });
}

// Get crimes inside the circle centered on location, with radius distance,
// within the date range given
function getCrimesNearby(location, distance, date) {
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

// Get crimes within a bounding box, within the date range (if specified),
// matching the crime type given. Central location is defined by the center of
// the bounding box, within a radius of the smallest of width and height.
function getCrimesWithinArea(boundingBox, date_start, date_end, crime_type) {
    boundingBox = {
        NE: [ parseFloat(boundingBox.NE[0]), parseFloat(boundingBox.NE[1])],
        SW: [ parseFloat(boundingBox.SW[0]), parseFloat(boundingBox.SW[1])]
    }

    var height = Math.abs(boundingBox.NE[0] - boundingBox.SW[0])
    var width = Math.abs(boundingBox.NE[1] - boundingBox.SW[1])

    var height_meters = height * 111320
    var width_meters = width * ((4007500 * Math.cos(height * (Math.PI / 180))) / (2 * Math.PI))

    var radius = Math.min(height_meters, width_meters) / 1.5

    var location = {
        lat: boundingBox.SW[0] + Math.abs((boundingBox.NE[0] - boundingBox.SW[0]) / 2),
        lon: boundingBox.SW[1] + Math.abs((boundingBox.NE[1] - boundingBox.SW[1]) / 2)
    }

    const aggregation = []

    aggregation.push({
        $geoNear: {
            near: { type: "Point", coordinates: [ location.lon, location.lat ] },
            distanceField: "distance",
            maxDistance: radius
        }
    })

    if (date_start) {
        aggregation.push({ $match: { date: { $gte: date_start } } })
    }

    if (date_end) {
        aggregation.push({ $match: { date: { $lt: date_end } } })
    }

    if (crime_type) {
        aggregation.push({ $match: { crime_type: crime_type } })
    }

    aggregation.push({
        $group: {
            _id: "$location",
            count: { $sum: 1 },
            street_name: { "$first": "$street_name" },
            falls_within: { "$first": "$falls_within" }
        }
    })

    return mongodb.getAggregate('crimes', aggregation);
}

// Groups crime types into those with outcomes and those without, within the
// date range given (if specified), and the crime type given (if specified)
function getCrimesWithAnOutcome(date_start, date_end, crime_type) {
    const aggregation = []

    if (date_start) {
        aggregation.push({ $match: { date: { $gte: date_start } } })
    }
    if (date_end) {
        aggregation.push({ $match: { date: { $lt: date_end } } })
    }
    if (crime_type) {
        aggregation.push({ $match: { crime_type: { $eq: crime_type } } })
    }

    aggregation.push({
        $group: {
            _id: "$crime_type",
            with_outcome: {
                $sum: {
                    $cond: { if: { $ne: [ "$last_outcome_category", "" ] }, then: 1, else: 0 }
                }
            },
            without_outcome: {
                $sum: {
                    $cond: { if: { $eq: [ "$last_outcome_category", "" ] }, then: 1, else: 0 }
                }
            }
        }
    })
    aggregation.push({ $sort: { _id: 1 } })

    return mongodb.getAggregate('crimes', aggregation);
}

// Groups crimes into regions, counting crimes with outcomes and those without,
// within the date range given (if specified), and the crime type given (if
// specified)

function getRegionsWithOutcomes(date_start, date_end, crime_type) {
    const aggregation = []

    if (date_start) {
        aggregation.push({ $match: { date: { $gte: date_start } } })
    }
    if (date_end) {
        aggregation.push({ $match: { date: { $lt: date_end } } })
    }
    if (crime_type) {
        aggregation.push({ $match: { crime_type: { $eq: crime_type } } })
    }

    aggregation.push({
        $group: {
            _id: "$falls_within",
            with_outcome: {
                $sum: {
                    $cond: { if: { $ne: [ "$last_outcome_category", "" ] }, then: 1, else: 0 }
                }
            },
            without_outcome: {
                $sum: {
                    $cond: { if: { $eq: [ "$last_outcome_category", "" ] }, then: 1, else: 0 }
                }
            }
        }
    })

    aggregation.push({ $sort: { _id: 1 } })

    return mongodb.getAggregate('crimes', aggregation);
}

// Returns crimes from a region, starting at <index>, running for <limit> crimes
function getCrimesByRegion(region, index, limit) {
    return mongodb.getRecords('crimes', { query: { crime_type: region }, index: index, limit: limit });
}

module.exports = {
    intialize: intialize,
    getCrimeTypes: getCrimeTypes,
    getRegions: getRegions,
    getOutcomes: getOutcomes,
    getStats: getStats,

    getCrimes: getCrimes,
    getCrimesNearby: getCrimesNearby,
    getCrimesWithinArea: getCrimesWithinArea,
    getCrimesByRegion: getCrimesByRegion,
    getCrimesWithAnOutcome: getCrimesWithAnOutcome,
    getRegionsWithOutcomes: getRegionsWithOutcomes
}
