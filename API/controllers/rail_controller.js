var postgres = require('../data/postgres');

function getStopSimple(atco) {
    return new Promise((resolve) => {
        const query = {
            text:  `SELECT * 
                    FROM naptan_bus_stops 
                    WHERE atco = '${atco}'`
        }

        postgres.query(query).then((data) => {
            data = data.rows[0];
            data.type = 'rail';
            resolve(data)
        });
    })
}

module.exports = {
    getStopSimple: getStopSimple
}