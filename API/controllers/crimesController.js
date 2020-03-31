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

var stats;

function intialize() {
    return new Promise((resolve) => {
        mongodb.intialize()
        .then(() => {
            generateStats().then(() => {
                console.log(stats);
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

function generateStats() {

    function getCrimesWithAnOutcome() {
        const aggregation =
            [
                {
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
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]

        return mongodb.getAggregate('crimes', aggregation);
    }

    function getRegionsWithOutcomes() {
        const aggregation =
            [
                {
                    $group: {
                        _id: "$falls_within",
                        with_outcome: {
                            $sum: {
                                $cond: { if: { $eq: [ "$last_outcome_category", "" ] }, then: 0, else: 1 }
                            }
                        },
                        without_outcome: {
                            $sum: {
                                $cond: { if: { $eq: [ "$last_outcome_category", "" ] }, then: 1, else: 0 }
                            }
                        }
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
        getCrimesWithAnOutcome(),
        getRegionsWithOutcomes(),
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

function getStats() {
    return stats;
}

function getCrimes(index, limit) {
    return mongodb.getRecords('crimes', { index: index, limit: limit });
}

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

function getCrimesWithinArea(boundingBox, date_start, date_end, crime_type) {
    // boundingBox = [ latitude, longitude ]

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

function getCrimesWithAnOutcome(date_start, date_end, crime_type) {
    const aggregation =
        [
            {
                $match: {
                    crime_type: crime_type,
                    date: {
                        $gte: date_start,
                        $lt: date_end
                    }
                }
            },
            {
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
            },
            {
                $sort: {
                    _id: 1
                }
            }
         ]

    return mongodb.getAggregate('crimes', aggregation);
}

function getRegionsWithOutcomes(date_start, date_end, crime_type) {
    const aggregation =
        [
            {
                $match: {
                    crime_type: crime_type,
                    date: {
                        $gte: date_start,
                        $lt: date_end
                    }
                }
            },
            {
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
            },
            {
                $sort: {
                    _id: 1
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
    getRegionsWithOutcomes: getRegionsWithOutcomes,
    getSearchResults: getSearchResults,
}
