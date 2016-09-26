const
    Crawler     = require('node-webcrawler'),
    url         = require('url'),
    config      = require('./config'),
    mongodb     = require('./mongodb'),
    mysqldb     = require('./mysql');


const startUrl = 'https://en.wikipedia.org/wiki/Portal:Mathematics';

mysqldb.sequelize.sync({sync:true}).then(function() {

    let c = require('./crawler');

    mongodb.init(function() {
        c.queue(startUrl);
    });
});

let exitHandler = function(options, error) {
    if(error) {
        console.log(error);
    }

    mongodb.close();
    process.exit();
};

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
