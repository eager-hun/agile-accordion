/**
 * @file
 * Gulpfile.
 */

/*

NOTES:

Docs:

https://github.com/gulpjs/gulp/blob/master/docs/API.md
https://github.com/gulpjs/gulp/tree/master/docs/recipes

Overviews:

http://andy-carter.com/blog/a-beginners-guide-to-the-task-runner-gulp
https://markgoodyear.com/2014/01/getting-started-with-gulp/
http://www.chenhuijing.com/blog/drupal-101-theming-with-gulp/

On concatenating files:

// Gulp minify multiple js files to one
http://stackoverflow.com/a/26719941
// Using Gulp to Concatenate and Uglify files
http://stackoverflow.com/a/24597914

Complex example might worth examining:
http://stackoverflow.com/a/31436472

On sourcemaps:
https://github.com/floridoo/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support

When it comes to Browserify:
https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md

*/


// #############################################################################
// Gulp wiring.
// See https://www.npmjs.com/package/<plugin-name>

const gulp         = require('gulp');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const jshint       = require('gulp-jshint');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const concat       = require('gulp-concat');
const del          = require('del');
const order        = require('gulp-order');
const browsersync  = require('browser-sync').create();
// const plumber      = require('gulp-plumber');


// #############################################################################
// Project setup.

// Locations.
const externalPathToGulpfile    = '/a-accordion';

const internalCssSource         = 'source/sass';
const internalCssDestination    = 'build/css';

const internalCustomJsSource    = 'source/js';
const internalJsDestination     = 'build/js';

const internalBowerLibsSource   = 'bower_components';
const internalLibsSource        = 'source/libs';

// Output filenames.
const jsLibsBundle   = 'a-accordion'; // Base of the filename.
const jsCustomBundle = 'init'; // Base of the filename.

// Opts.
var buildOpts = {
  projectLocalDomain: 'http://alpha' + externalPathToGulpfile,
  // Should browsers be reloaded when files with these extensions get changed?
  reloadOn: {
    html: true,
    php: true
  },
  // Cleaning deletes earlier instances of built files before writing new ones.
  cleaning: {
    enabled: true,
    verbose: false
  }
};

// -----------------------------------------------------------------------------
// Plugin options generally.

var uglifyOpts = {
  mangle: false
};

// Note that options from https://github.com/sass/node-sass/blob/master/README.md
// may also apply.
var sassOpts = {
  // See https://web-design-weekly.com/2014/06/15/different-sass-output-styles/
  // nested || expanded || compact || compressed
  outputStyle: 'expanded'
};

// https://github.com/postcss/autoprefixer#options
// https://github.com/ai/browserslist#queries
var autoprefixerOpts = {
  // Foundation 6 recommendation: http://foundation.zurb.com/sites/docs/sass.html
  browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
  flexbox: 'no-2009',
  cascade: true
};

var sourcemapsOpts = {
  css: {
    sourceMappingURLPrefix: externalPathToGulpfile + '/' + internalCssDestination
  },
  js: {
    sourceMappingURLPrefix: externalPathToGulpfile + '/' + internalJsDestination
  }
};


// #############################################################################
// Task defs and options.

// -----------------------------------------------------------------------------
// CLEANING DESTINATIONS.

var delOptsForCleaningTask = {dryRun: false}; // For build script dev.

var announceCleaning = function announceCleaning(paths) {
  if (paths.length > 0) {
    if (delOptsForCleaningTask.dryRun) {
      console.log('Files and folders that would be deleted:');
      console.log(paths.join('\n'));
    }
    else if (buildOpts.cleaning.verbose) {
      console.log('Deleted files and folders:');
      console.log(paths.join('\n'));
    }
  }
};

gulp.task('clean-css', function () {
  if (buildOpts.cleaning.enabled) {
    del([internalCssDestination + '/*'], delOptsForCleaningTask)
      .then(announceCleaning);
  }
});

gulp.task('clean-custom-js', function () {
  if (buildOpts.cleaning.enabled) {
    var globs = [
      internalJsDestination + '/' + jsCustomBundle + '.js',
      internalJsDestination + '/' + jsCustomBundle + '.min.js',
      internalJsDestination + '/sourcemaps/' + jsCustomBundle + '.js.map',
      internalJsDestination + '/sourcemaps/' + jsCustomBundle + '.min.js.map',
    ];
    del(globs, delOptsForCleaningTask)
      .then(announceCleaning);
  }
});

// -----------------------------------------------------------------------------
// COMPILING CSS.

gulp.task('compile-css', ['clean-css'], function () {
  return gulp.src(internalCssSource + '/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOpts)
      .on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOpts))
    .pipe(sourcemaps.write('./sourcemaps', sourcemapsOpts.css))
    .pipe(gulp.dest(internalCssDestination))
    .pipe(browsersync.stream({match: '**/*.css'}));
});

// -----------------------------------------------------------------------------
// COMPILING JS.

gulp.task('compile-custom-js', ['clean-custom-js'], function() {

  var customJsSourcemapsOpts = sourcemapsOpts.js;

  return gulp.src(internalCustomJsSource + '/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(internalJsDestination))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify(uglifyOpts))
    .pipe(sourcemaps.write('./sourcemaps', customJsSourcemapsOpts))
    .pipe(gulp.dest(internalJsDestination))
    .pipe(browsersync.stream({match: '**/*.js'}));
});

// -----------------------------------------------------------------------------
// WATCHING AND BROWSERSYNCING.
// See https://www.browsersync.io/docs/gulp/

var watcherAnnounce = function watcherAnnounce(event) {
  console.log(event.path + ' <<== File was ' + event.type + '; running tasks:');
};

gulp.task('serve', ['compile-css', 'compile-custom-js'], function() {
  browsersync.init({
    proxy: buildOpts.projectLocalDomain
    // browser: Firefox
  });

  // See https://www.browsersync.io/docs/gulp/#gulp-reload
  // + See https://www.browsersync.io/docs/gulp/#gulp-manual-reload
  // + See https://github.com/gulpjs/gulp/blob/master/docs/API.md#user-content-tasks

  gulp.watch([internalCssSource + '/*.scss'], ['reload-at-css'])
    .on('change', watcherAnnounce);

  gulp.watch([internalCustomJsSource + '/*.js'], ['reload-at-custom-js'])
    .on('change', watcherAnnounce);

  if (buildOpts.reloadOn.html) {
    gulp.watch('**/*.html')
      .on('change', function(event) {
        watcherAnnounce(event);
        browsersync.reload();
      });
  }

  if (buildOpts.reloadOn.php) {
    gulp.watch('**/*.php')
      .on('change', function(event) {
        watcherAnnounce(event);
        browsersync.reload();
      });
  }
});

// Resource-specific compiler+reloaders.
gulp.task('reload-at-css', ['compile-css'], browsersync.reload);
gulp.task('reload-at-custom-js', ['compile-custom-js'], browsersync.reload);

// -----------------------------------------------------------------------------
// Automatic execution of the default build sequence at the `gulp` command.

gulp.task('default', ['serve']);


// #############################################################################
// Known bugs and issues:

// gulp.watch: Error: watch ENOENT (When renaming a directory.)
// https://github.com/gulpjs/gulp/issues/427#issuecomment-114848813

// Sass sourcemaps:
// Wrong line numbers working with Libsass
// Note: seemingly only when using 'compressed' output.
// https://github.com/floridoo/gulp-sourcemaps/issues/88

// Js sourcemaps:
// In Chrome console, Js sourcemap data are not picked up/displayed on page
// load, only after page reload.
// In Firefox, Js sourcemap data are not used by the console tab (though in the
// Debugger tab they are utilized); This is a Firefox issue:
// https://bugzilla.mozilla.org/show_bug.cgi?id=670002

// Error: EEXIST: file already exists, mkdir '/xxxxxx/build/css/sourcemaps' at Error (native)

