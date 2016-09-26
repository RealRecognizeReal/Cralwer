const
    Crawler     = require('node-webcrawler'),
    url         = require('url'),
    mongodb     = require('./mongodb'),
    mysql       = require('./mysql');

let cnt = 0;

let c = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback: function (error, result, $) {
        if(error) {
            console.error(error);
            return;
        }

        if( typeof $ !== 'function' ) return;

        mysql.page.findOrCreate(
            {
                where: {url: result.uri},
                defaults: {
                    url: result.uri,
                    status: 'grey'
                }
            }
        ).then(function(page, created) {
            if( !created && page.status === 'black' ) return;

            if( created ) {
                let formula = $('.mwe-math-fallback-image-inline').map(function() {
                    return $(this).attr('alt');
                }).get();

                console.log(formula, $('title').text());

                if( formula.length > 0 ) {
                    mongodb.insertPage({
                        title: $('title').text(),
                        formula
                    });
                }
            }

            let hostname, protocol;

            ({hostname, protocol} = url.parse(result.uri));

            let nextList = $('a').map(function() {
                let href = $(this).attr('href');
                if( !href || href[0] === '#' ) return undefined;

                return protocol + '//' + hostname + href;
            }).get();

            try {
                c.queue(nextList);
            }
            catch(e) {
                console.error(e);
                return;
            }

        }).catch(function(e) {
            console.error(e);
        })
    }
});

module.exports = c;