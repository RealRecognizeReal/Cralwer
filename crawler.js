const
    Crawler     = require('simplecrawler'),
    url         = require('url'),
    mongodb     = require('./mongodb'),
    cheerio     = require('cheerio');

module.exports = function(startUrl) {
    let crawler = new Crawler(startUrl);

    crawler.interval = 500;
    crawler.maxConcurrency = 4;
    crawler.maxDepth = 5;
    crawler.downloadUnsupported = true;

    crawler.addFetchCondition(function(queueItem, response) {
        return !queueItem.path.match(/\.(pdf|css|js|jpg|jpeg|png|bmp|svg)$/i);
    });

    crawler.addDownloadCondition(function(queueItem, response) {
        return queueItem.stateData.contentType.indexOf('text/html') !== -1;
    });

    crawler.on('fetchcomplete', function(queueItem, data, res) {
        let currentUrl = queueItem.url;

        mongodb.findPageByUrl(currentUrl, function(err, [page]) {
            if(err || page) {
                if(err)console.error(err);
                return;
            }

            let $ = cheerio.load(data.toString('utf8'));
            if(typeof $ !== 'function') return;

            let title = $('title').text();

            mongodb.findPageByTitle(title, function(err, [pageWithTitle]) {
                if(err) {
                    console.error(err);
                    $ = null;
                    return;
                }

                let redirect, formulas, formulasNumber;
                if(pageWithTitle) {
                    redirect = pageWithTitle.url;
                }
                else {
                    formulas = $('img.mwe-math-fallback-image-inline').map(function(idx, item) {
                        let $item = $(item);

                        return {img: $item.attr('src'), latex: $item.attr('alt'), mathml: $item.prev().html()};
                    }).get();

                    formulasNumber = formulas.length;
                }

                mongodb.insertPage({
                    title,
                    url: currentUrl,
                    redirect,
                    formulas,
                    formulasNumber
                }, function() {
                    $ = null;
                    formulas = null;
                });
            })

        });


    });

    return crawler;
}