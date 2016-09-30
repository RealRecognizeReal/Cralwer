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

        //db.collection('page').drop(function() {
            db.collection('page').createIndex({'url':1}, {unique: true}, function() {
                db.collection('page').createIndex({'title':1}, {unique: true}, function() {
                    callback();
                });
            });

        //});

    });
};

let findPageByUrl = function(url, cb) {
    let collection = db.collection('page');

    collection.find({url}).limit(1).toArray(cb);
}

let findPageByTitle = function(title, cb) {
    let collection = db.collection('page');

    collection.find({title}).limit(1).toArray(cb);

}
let insertPage = function(page, cb) {
    let collection = db.collection('page');

    collection.insertOne(page, cb);

};

let findStartUrl = function(cb) {
    let collection = db.collection('page');

    const start = 'https://en.wikipedia.org/wiki/Portal:Mathematics';

    collection
        .find({root: {$ne: true}, url: {$ne: start}})
        .sort({formulasNumber: -1})
        .limit(1)
        .toArray(function(err, [page]) {
            if(page) {
                collection.update({url: page.url}, {$set: {root: true}}, function() {
                    cb(page.url);
                })
            }
            else cb(start);
        }
    );
}
let close = function() {
    if(db) db.close();
};

module.exports = {
    init,
    insertPage,
    findPageByUrl,
    findStartUrl,
    findPageByTitle,
    close
}