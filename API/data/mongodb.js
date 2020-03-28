const credentials = require('../credentials');
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
let _db, _client;

module.exports = {
    intialize: () => {
        var url = "mongodb://" + config.mongodb.host + ":" + config.mongodb.port;
        return new Promise((resolve) => {
            MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                _db = client.db(config.mongodb.database);
                _client = client;
                console.log("mongodb connected");
                resolve();
            })
        })
    },

    getDB: () => {
        return _db;
    },

    disconnect: () => {
        _client.close();
        console.log("mongodb disconnected");
    },

    getRecords: (collection, options) => {
        if(typeof options.query == "undefined") { options.query = {} };
        if(typeof options.fields == "undefined") { options.fields = { _id: 0 } };
        if(typeof options.index == "undefined") { options.index = 0 };
        if(typeof options.limit == "undefined") { options.limit = 0 };

        return new Promise((resolve) => {
            _db.collection(collection).find(options.query, { projection: options.fields })
                .skip(options.index)
                .limit(options.limit)
                .toArray((err, result) => {
                    resolve(result)
                });
        })
    },


    getDistinct: (collection, options) => {
        if(typeof options.query == "undefined") { options.query = {} };
        if(typeof options.fields == "undefined") { options.fields = { _id: 0 } };
        if(typeof options.index == "undefined") { options.index = 0 };
        if(typeof options.limit == "undefined") { options.limit = 0 };

        return new Promise((resolve) => {
            _db.collection(collection).distinct(options.query, function (err, result) {
                resolve(result);
            });
        })
    }
};
