const mongodb = require('../data/mongodb')

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
    return mongodb.getDistinct("crimes", "crime_type")
}

// Return static regions
function getRegions() {
    return mongodb.getDistinct("crimes", "falls_within")
}

// Return static crime outcomes
function getOutcomes() {
    return mongodb.getDistinct("crimes", "last_outcome_category")
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
    var height = Math.abs(boundingBox.NE[0] - boundingBox.SW[0])
    var width = Math.abs(boundingBox.NE[1] - boundingBox.SW[1])

    var height_meters = height * 111320
    var width_meters = Math.abs(width * ((4007500 * Math.cos(height * (Math.PI / 180))) / (2 * Math.PI)))

    var radius = Math.min(height_meters, width_meters, 10000) / 1.5

    var location = {
        lat: boundingBox.SW[0] + ((boundingBox.NE[0] - boundingBox.SW[0]) / 2),
        lon: boundingBox.SW[1] + ((boundingBox.NE[1] - boundingBox.SW[1]) / 2)
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
            _id: { location: "$location", crime_type: "$crime_type" },
            crime_count: { $sum: 1 },
            falls_within: { "$push": "$falls_within" }
        }
    })

    aggregation.push({
        $project: {
            crime_and_count: {
                $concat: [ "$_id.crime_type", ": ", { "$toString": "$crime_count" } ]
            },
            location: "$_id.location",
            crime_count: 1,
            falls_within: 1
        }
    })

    aggregation.push({
        $group: {
            _id: "$location",
            count: { $sum: "$crime_count" },
            crime_counts: { $addToSet: "$crime_and_count" },
            falls_within: { $push: "$falls_within" }
        }
    })

    aggregation.push({
        $project: {
            _id: 0, location: "$_id", count: 1, crime_counts: 1,
            falls_within: {
                $reduce: {
                    input: "$falls_within",
                    initialValue: [],
                    in: { $setUnion: [ "$$value", "$$this" ] }
                }
            }
        }
    })

    aggregation.push(
        { $unwind: "$falls_within" },
        { $sort: { falls_within: 1 } },
        {
            $group: {
                _id: { location: "$location", count: "$count", crime_counts: "$crime_counts" },
                falls_within: { $push: "$falls_within" }
            }
        },
        {
            $project: {
                location: "$_id.location",
                crime_counts: "$_id.crime_counts",
                count: "$_id.count",
                falls_within: 1,
                _id: 0
            }
        }
    )

    aggregation.push(
        { $unwind: "$crime_counts" },
        { $sort: { crime_counts: 1 } },
        {
            $group: {
                _id: { location: "$location", count: "$count", falls_within: "$falls_within" },
                crime_counts: { $push: "$crime_counts" }
            }
        },
        {
            $project: {
                _id: "$_id.location",
                falls_within: "$_id.falls_within",
                count: "$_id.count",
                crime_counts: 1
            }
        }
    )

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
