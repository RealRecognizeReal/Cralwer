const
    Crawler     = require('node-webcrawler'),
    url         = require('url'),
    config      = require('./config'),
    mongodb     = require('./mongodb'),
    mysqldb     = require('./mysql');


const startUrl = 'https://en.wikipedia.org/wiki/Portal:Mathematics';

setInterval(function () {
    if (typeof gc === 'function') {
        gc();
    }
    console.log('Memory Usage', process.memoryUsage());
}, 6000);

mysqldb.sequelize.sync({force:true}).then(function() {

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
