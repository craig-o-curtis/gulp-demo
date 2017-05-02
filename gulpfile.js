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

// LESS -> css
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

gulp.task('less-watcher', function() {
    gulp.watch([config.less], ['styles']);
});

// HTML injection = HoT MeatLoaf injection
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

// injects styles separately from js
gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wire up the bower css js and app js into index.html');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

// Dev server
gulp.task('serve-dev', ['inject'], function() {
    var isDev = true;

    var nodeOptions = {
        script: config.nodeServer, // path to src/server/app.js
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
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
            startBrowserSync();
        })
        .on('crash', function() {
            log('** nodemon crashed **');
        })
        .on('exit', function() {
            log('** nodemon exited **');
        });
});

//////////////
function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    // event.type == added / changed / deleted
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}


function startBrowserSync() {
    // check to see if already running
    // if pass in --nosync as arg, then returns
    // ex; $ gulp serve-dev --nosync
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    // internal watch less files,
    gulp.watch([config.less], ['styles'])
        .on('change', function(event){ changeEvent(event); });

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ],
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
