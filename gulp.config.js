module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var report = './report/';
    var root = './';
    var server = './src/server/';
    var temp = './.tmp/'; // for css path
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true})['js'];

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
        report: report,
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
         * Karma tests settings
         */
        specHelpers: [client + 'test-helpers/*.js'],
        serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js'],


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
    };

    config.karma = getKarmaOptions();

    return config;

    /////////////

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                client + '**/*.module.js',
                client + '**/*.js',
                temp + config.templateCache.file,
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },
            preprocessors: {}
        };
        options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }
};
