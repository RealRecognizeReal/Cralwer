const
    Crawler     = require('simplecrawler'),
    url         = require('url'),
    mongodb     = require('./mongodb'),
    cheerio     = require('cheerio');

module.exports = function(startUrl) {
    let crawler = new Crawler(startUrl);

    crawler.interval = 500;
    crawler.maxConcurrency = 5;

    crawler.addFetchCondition(function(queueItem, response) {
        return !queueItem.path.match(/\.(pdf|css|js|jpg|jpeg|png|bmp|svg)$/i);
    });

    crawler.addDownloadCondition(function(queueItem, response) {
        return queueItem.stateData.contentType.indexOf('text/html') !== -1;
    });

    crawler.on('fetchcomplete', function(queueItem, data, res) {
        let done = this.wait();

        let $ = cheerio.load(data.toString('utf8'));

        if(typeof $ !== 'function') return;

        let currentUrl = queueItem.url;

        mongodb.findPageByUrl(currentUrl, function(err, [page]) {
            if(err || page) {
                if(err)console.error(err);
                return;
            }

            let formulas = $('img.mwe-math-fallback-image-inline').map(function(idx, item) {
                return {img: $(item).attr('src'), latex: $(item).attr('alt'), mathml: $(item).prev().html()};
            }).get();

            mongodb.insertPage({
                title: $('title').text(),
                url: currentUrl,
                formulas,
                formulasNumber: formulas.length
            }, function() {
                delete $, formulas;
            });


            done();
        });


    });

    return crawler;
}