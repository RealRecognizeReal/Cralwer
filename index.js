const
    Crawler     = require('node-webcrawler'),
    url         = require('url');


let c = new Crawler({
    maxConnections: 10,
    skipDuplicates: true,
    callback: function (error, result, $) {
        if(error) return;

        if( typeof $ !== 'function' ) return;

        let hostname, protocol;

        try {
            ({hostname, protocol} = url.parse(result.uri));
        }
        catch(e) {
            console.error(e);
            return;
        }

        let nextList = $('a').map(function() {
            let href = $(this).attr('href');
            if( !href || href[0] === '#' ) return undefined;

            return protocol + '//' + hostname + href;
        }).get();

        console.log($('.mwe-math-fallback-image-inline').map(function() {
            return $(this).attr('alt');
        }).get(), $('title').text());

        try {
            c.queue(nextList);
        }
        catch(e) {
            console.error(e);
            return;
        }
    }
});

c.queue('https://en.wikipedia.org/wiki/Portal:Mathematics');