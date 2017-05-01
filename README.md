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

- Gulp dev dependencies
```
    "browser-sync": "^2.18.8",
    "del": "^2.2.2",
    "gulp": "^3.9.1",
    "gulp-autoprefixer": "^3.1.1",
    "gulp-if": "^2.0.2",
    "gulp-imagemin": "^3.2.0",
    "gulp-inject": "^4.2.0",
    "gulp-jscs": "^4.0.0",
    "gulp-jshint": "^2.0.4",
    "gulp-less": "^3.3.0",
    "gulp-load-plugins": "^1.5.0",
    "gulp-nodemon": "^2.2.1",
    "gulp-plumber": "^1.1.0",
    "gulp-print": "^2.0.1",
    "gulp-task-listing": "^1.0.1",
    "gulp-util": "^3.0.8",
    "jshint": "^2.9.4",
    "jshint-stylish": "^2.2.1",
    "wiredep": "^4.0.0",
    "yargs": "^7.1.0"
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





