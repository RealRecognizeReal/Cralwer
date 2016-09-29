const
    Crawler     = require('simplecrawler'),
    url         = require('url'),
    mongodb     = require('./mongodb'),
    cheerio     = require('cheerio'),
    mysql       = require('./mysql');
//
//let c = new Crawler({
//    maxConnections: 2,
//    skipDuplicates: true,
//    callback: function (error, result, $) {
//        if(error) {
//            console.error(error);
//            return;
//        }
//
//        if( typeof $ !== 'function' ) return;
//
//        mysql.page.findOrCreate(
//            {
//                where: {url: result.uri},
//                defaults: {
//                    url: result.uri,
//                    status: 'grey'
//                }
//            }
//        ).then(function(res) {
//            let [page, created] = res;
//
//            if( !created && page.status === 'black' ) return;
//
//            if( created ) {
//                let formula = $('.mwe-math-fallback-image-inline').map(function() {
//                    return $(this).attr('alt');
//                }).get();
//
//                //console.log(formula, $('title').text());
//
//                if( formula.length > 0 ) {
//                    mongodb.insertPage({
//                        title: $('title').text(),
//                        formula
//                    });
//                }
//            }
//
//            let hostname, protocol;
//
//            ({hostname, protocol} = url.parse(result.uri));
//
//            let nextList = $('a').map(function() {
//                let href = $(this).attr('href');
//
//                if( !href || href[0] === '#' ) return undefined;
//
//                if( href[0] === '/' ) return protocol + '//' + hostname + href;
//
//                return href;
//            }).get();
//
//            try {
//                c.queue(nextList);
//            }
//            catch(e) {
//                console.error(e);
//                return;
//            }
//
//        }).catch(function(e) {
//            console.error(e);
//        })
//    }
//});

module.exports = function(startUrl) {
    let crawler = new Crawler(startUrl);

    crawler.interval = 500;
    crawler.maxConcurrency = 2;

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
                formulas
            });

            done();
        });


    });

    return crawler;
}