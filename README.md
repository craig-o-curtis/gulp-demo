# Gulp Basics Demo
// from Pluralsight's Gulp Fundamentals Course by John Papa

## Requirements

- Global dependencies - node-inspector, bower, gulp

```
npm install -g node-inspector bower gulp
```

- Starter Local dependencies
```
npm install
bower install
npm start
```


/******** 4 basic Gulp APIs: ****************/
    gulp.task
    gulp.src
    gulp.dest
    gulp.watch

1. ******** gulp.task ********
ex:
    gulp.task('js', ['jscs', 'jshint'], function() {
        return gulp
            .src('./src/**/*.js')
            .pipe(concat('all.js')) // creates concat'ed file named all.js
            .pipe(uglify())
            .pipe(gulp.dest('./dist/'));
    }; 
    // call with $ gulp js
    // arg1 = task name
    // arg2 = dependencies - run in parallel before task runs

2. ******** gulp.src ********
    gulp.src(glob[, options])
    // glob = file pattern match
ex: 
    gulp.task('js', ['jscs', 'jshint'], function() {
        return gulp
            .src('./src/**/*.js', {base: './src/'}) // omits src in path
            ...
    })


3. ******** gulp.dest ********
    gulp.task('js', ['jscs', 'jshint'], function() {
        return gulp
            .src('./src/**/*.js')
            .pipe(concat('all.js')) // creates concat'ed file named all.js
            .pipe(uglify())
            .pipe(gulp.dest('./dist/'));
    }; // dist/all.js

4. ******** gulp.watch ********
// gulp.watch(glob [, options], tasks|callback )

    gulp.task('lint-watcher', function() {
        gulp.watch('./src/**/*.js', [
            'jshint',
            'jscs'
        ]);
    });


# Script injection -- via wiredep and gulp-inject

<!-- wiredep -->
 // injects bower components automagicallly in index.html
 <!-- bower:css -->
 <!-- endbower -->


// have Bower inject script after install
// see .bowerrc file, script --- postinstall script calls gulp wiredep    
```
    ...
    "scripts": {
        "postinstall": "gulp wiredep"
    }
```

/***** Local Server *****/
/** Live Reloading - BrowserSync **/
// uses sockets.io
// ghostMode -- sync actions between browsers
// confirm browser-sync installed, else:

## Gulp Commands

Help
```
gulp || gulp help
```

Serve
```
gulp serve-dev || gulp serve-dev --nosync
```


// Features
angular template caching via gulp-angular
// useref plugin to slim down script tags to single script tag for dist version
// gulp-useref API

1. .pipe($.useref.assets())
// gets assets from <!-- -->

2. .pipe($.useref.assets.restore())
// restores files back in stream

3. .pipe($.useref())
// concatenates files, writes to index.html





