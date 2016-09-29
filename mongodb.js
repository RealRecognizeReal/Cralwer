const
    MongoClient = require('mongodb').MongoClient,
    mConfig     = require('./config').mongodb,
    assert      = require('assert');

const mongoUrl = `mongodb://${mConfig.host}:${mConfig.port}/${mConfig.database}`;


let db;

let init = function(callback) {
    MongoClient.connect(mongoUrl, function(err, _db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        db = _db;

        db.collection('page').drop(function() {
            db.collection('page').createIndex({'url':1}, {unique: true}, function() {
                callback();
            });

        });

    });
};

let findPageByUrl = function(url, cb) {
    let collection = db.collection('page');

    collection.find({url}).limit(1).toArray(cb);
}

let insertPage = function(page) {
    let collection = db.collection('page');

    collection.insertOne(page);

};

let close = function() {
    if(db) db.close();
};

module.exports = {
    init,
    insertPage,
    findPageByUrl,
    close
}