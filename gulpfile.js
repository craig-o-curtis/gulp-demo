var gulp = require('gulp'); // npm install -g gulp // npm install --save-dev gulp
var args = require('yargs').argv; // npm install --save-dev yargs
var browserSync = require('browser-sync');
var config = require('./gulp.config')(); // ref to gulp.config.js module, then run it with ()
var del = require('del'); // npm install --save-dev del
var $ = require('gulp-load-plugins')({lazy: true}); // only loads plugins that are being used!
var port = process.env.PORT || config.defaultPort; // process.env.PORT - from command line

// list defined gulp tasks
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

// check code with jshint and jscs
 // gulp vet --verbose // prints out each file
gulp.task('vet', function(){
    gulp.src(config.alljs)
        .pipe($.if( args.verbose, $.print() ) )
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

// styles = LESS -> css
    // clean-styles = delate all temp css

    // last 2 versions, more than 5% of the market
    // .on('error', errorLogger) // old way, after less pipe
gulp.task('styles', ['clean-styles'], function(){
    log('Compile LESS -> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

// grab fonts and put in dist folder
gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts...');

    return gulp.src(config.fonts)
        .pipe(gulp.dest(config.dist + 'fonts'));
});


// minify images
gulp.task('images', ['clean-images'], function() {
   log('Copying and compressing images');

   return gulp
    .src(config.images)
    .pipe($.imagemin({optimizationLevel: 4}))
    .pipe(gulp.dest(config.dist + 'images'));
});


// clean all
gulp.task('clean', function(done) {
    var delconfig = [].concat(config.dist, config.temp); // like push on steroids
    log('Cleaning: ' + $.util.colors.bgRed.white(delconfig));
    del(delconfig, done);
});

// clean-styles = delate all temp css
    // done arg is a callback that makes tasks run in sync
gulp.task('clean-styles', function(done) {
    clean(config.temp + '**/*.css', done);
});
// prebuild clean fonts
gulp.task('clean-fonts', function(done) {
    clean(config.dist + 'fonts/**/*.*', done);
});
// prebuild clean images
gulp.task('clean-images', function(done) {
    clean(config.dist + 'images/**/*.*', done);
});

// clean-code = delete all temp and dist html & js
gulp.task('clean-code', function(done){
    // better way to push to an array --- [].concat()
    var files = [].concat(
        config.temp + '**/*.js',
        config.dist + '**/*.html',
        config.dist + 'js/**/*.js'
    );
    clean(files, done);
});


gulp.task('less-watcher', function() {
    // styles = LESS -> css
    gulp.watch([config.less], ['styles']);
});

// templatecache = create templatecache list and prep to inject into tags
    // clean-code = delete all temp and dist html & js

    // reduce HTTP calls for templates
    // first clear out code from .tmp and dist
gulp.task('templatecache', ['clean-code'], function(){
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates) // grab all html dir template files
        .pipe($.htmlmin({collapseWhitespace: true, empty: true})) // minify
        .pipe($.angularTemplatecache( //
            config.templateCache.file, // specify name of file to create - 'templates.js'
            config.templateCache.options // tell gulp to go look for app.core angular module
        ))
        .pipe(gulp.dest(config.temp));
});

// wiredep = HTML injection between <!-- inject:js --><!-- endinject -->
gulp.task('wiredep', function() {
    log('Wire up the bower css js and app js into index.html');

    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

// inject = injects <!-- inject:css --><!-- endinject -->
    // wiredep = HTML injection between <!-- inject:js --><!-- endinject -->
    // styles = LESS -> css
    // templatecache = create templatecache list and prep to inject into tags
gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
    log('Wire up the bower css js and app js into index.html');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

// Build Pipeline, injects lib and app both css and js between: \
    // inject = injects <!-- inject:css --><!-- endinject -->

    // <!-- build:css styles/lib.css --><!-- endbuild -->
    // <!-- build:css styles/app.css --><!-- endbuild -->
    // <!-- build:js js/lib.js --><!-- endbuild -->
    // <!-- build:js js/app.js --><!-- endbuild -->
gulp.task('optimize', ['inject', 'fonts', 'images'], function() {
    log('Optimize all files');

    var assets = $.useref.assets({searchPath: './'}); // gather assets from <!-- -->
    var templateCache = config.temp + config.templateCache.file;
    var cssFilter = $.filter('**/*.css', {restore: true});
    var jsLibFilter = $.filter('**/' + config.optimized.lib, {restore: true});
    var jsAppFilter = $.filter('**/' + config.optimized.app, {restore: true});

    return gulp
        .src(config.index)
        .pipe($.plumber()) // error handling
        .pipe($.inject(gulp.src(templateCache, {read: false}), {starttag: '<!-- inject:templates:js -->'} )) // inject template.js into index.html
        .pipe(assets) // get js and css files from <!-- build:* --><!-- endbuild -->

        .pipe(cssFilter) // filter down to css
        .pipe($.csso()) // csso
        .pipe(cssFilter.restore) // filter restore to get all files back

        .pipe(jsLibFilter) // filter down to js 3rd party libs
        .pipe($.uglify())
        .pipe(jsLibFilter.restore) // restore lib files back

        .pipe(jsAppFilter)
        .pipe($.ngAnnotate())// optional instead of $inject or array literal to avoid minification var mangling
        .pipe($.uglify())
        .pipe(jsAppFilter.restore) // restore files back

        // change to hashed file names
        .pipe($.rev()) // app.js --> app.01234.js

        .pipe(assets.restore()) // get index.html back
        .pipe($.useref()) // replaces with one-liners for app.* and lib.* assets

        .pipe($.revReplace()) // renames hashed names inside index.html
        
        .pipe(gulp.dest(config.dist))
        .pipe($.rev.manifest()) // write namifest to keep track of hashed names

        .pipe(gulp.dest(config.dist));
});

// bump version number
/** 
 * Bump the version
 * --type=pre will bump the prerelease version *.*.*-x
 * --type=patch or no flag will bump the patch version *.*.x
 * --type=minor will bump the minor version *.x.*
 * --type=major will bump the major version x.*.*
 * --version=1.2.3 will bump to a specific version and ignore other flags
 */
gulp.task('bump', function(){
    var msg = 'Bumping versions';
    var type = args.type;
    var version = args.version;
    var options = {};

    if (version) {
        options.version = version
        msg += ' to ' + version;
    } else {
        options.type = type;
        msg += ' for a ' + type;
    }
    log(msg);

    return gulp
        .src(config.packages)
        .pipe($.bump(options))
        .pipe(gulp.dest(config.root));
});

// dist server
gulp.task('serve-build', ['optimize'], function(){
    serve(false);
});

// Dev server
    // inject = injects <!-- inject:css --><!-- endinject -->
gulp.task('serve-dev', ['inject'], function() {
    serve(true);
});

//////////////

function serve(isDev) {
    var nodeOptions = {
        script: config.nodeServer, // path to src/server/app.js
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'dist'
        },
        watch: [config.server] // files to restart
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            // restarts on file change on server
            // ev array of files that changed
            log('** nodemon restarted **');
            log('files changed on restart:\n' + ev);
            // guarantee file changes before reload
            setTimeout(function(){
                browserSync.notify('reloading now...');
                browserSync.reload({stream: false});

            }, config.browserReloadDelay );
        })
        .on('start', function() {
            log('** nodemon started **');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('** nodemon crashed **');
        })
        .on('exit', function() {
            log('** nodemon exited **');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    // event.type == added / changed / deleted
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}


function startBrowserSync(isDev) {
    // check to see if already running
    // if pass in --nosync as arg, then returns
    // ex; $ gulp serve-dev --nosync
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        // internally watch less files
            // watcher in option.files; watch less here, all others below
        // styles = LESS -> css
        gulp.watch([config.less], ['styles'])
            .on('change', function(event){ changeEvent(event); });
    } else {
        // build get app.* lib.* **.html
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload]) // build mode, optimize first then reload
            .on('change', function(event){ changeEvent(event); });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [ // watches files for bs in dev mode
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        // synced action between browsers
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    }

    browserSync(options);

}


// done function already exists on del, now just calling it when called
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done());
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item) ) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.cyan(msg));
    }
}
