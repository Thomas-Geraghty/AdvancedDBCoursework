var config = {
    development: {
        //url to be used in link generation
        //mongodb connection settings
        database: {
            host:   '127.0.0.1',
            port:   '27017',
            db:     'FYP_DB'
        },
        //server details
        server: {
            host: '127.0.0.1',
            port: '8080'
        }
    }
}

module.exports = config;