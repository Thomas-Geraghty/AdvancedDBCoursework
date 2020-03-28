var config = {
    //url to be used in link generation
    //mongodb connection settings
    mongodb: {
        host: '127.0.0.1',
        port: '27017',
        database: 'police'
    },

    //server details
    server: {
        host: '0.0.0.0',
        port: '8080'
    }
}

module.exports = config;
