module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var root = './';
    var server = './src/server/';
    var temp = './.tmp/'; // for css path

    var config = {
        /*
         * File paths
         */

        // all js to vet
        alljs: [
            './src/**/*.js',
            './*.js'
        ],

        client: client,
        css: temp + 'styles.css',
        dist: './dist/',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        html: clientApp + '**/*.html',
        htmltemplates: clientApp + '**/*.html',
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js', // first modules
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js', // exclude
        ],

        less: [(client + 'styles/styles.less')],
        root: root,
        server: server,
        temp: temp,

        /*
         *  optimized files
         */
         optimized: {
             lib: 'lib.js',
             app: 'app.js'
         },

        /*
         *  Template Cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core', // angular module
                standAlone: false, // new module - true
                root: 'app/' // strip off extra URL params
            }
        },

        /*
         *  browser sync
         */
        browserReloadDelay: 1000,

        /*
         *  Bower & NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * Node settings
         */
        defaultPort: 7203,
        nodeServer: './src/server/app.js'

    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }

    return config;
}
