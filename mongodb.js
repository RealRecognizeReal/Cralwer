const
    MongoClient = require('mongodb').MongoClient,
    mConfig     = require('./config').mongodb,
    assert      = require('assert');

const mongoUrl = `mongodb://${mConfig.host}:${mConfig.port}/${mConfig.database}`;

console.log(mongoUrl);

let db;

let init = function(callback) {
    MongoClient.connect(mongoUrl, function(err, _db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        db = _db;

        db.collection('page').drop(function() {
            callback();
        });

    });
};

let insertPage = function(page) {
    let collection = db.collection('page');

    collection.insertOne({
        page
    }, () => {

    });

};

let close = function() {
    if(db) db.close();
};

module.exports = {
    init,
    insertPage,
    close
}