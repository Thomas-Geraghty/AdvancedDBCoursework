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
        http_port: '8080',
        https_port: '8443'
    }
}

module.exports = config;
