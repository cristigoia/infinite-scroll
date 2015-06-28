var browserSync = require('browser-sync'),
    bump        = require('gulp-bump'),
    concat      = require('gulp-concat'),
    coveralls   = require('gulp-coveralls'),
    del         = require('del'),
    eslint      = require('gulp-eslint'),
    gulp        = require('gulp'),
    header      = require('gulp-header'),
    karma       = require('karma').server,
    rename      = require('gulp-rename'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify'),
    umd         = require('gulp-umd');

var manifests = ['./bower.json', './package.json'];


gulp.task('bump:patch', function(){
  return gulp.src(manifests)
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});


gulp.task('bump:minor', function(){
  return gulp.src(manifests)
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});


gulp.task('clean:dist', function(done){
  del('./dist/*', done);
});


gulp.task('clean:target', function(done){
  del('./target/*', done);
});


gulp.task('concat', function concatenate(){
  return gulp.src('./src/*.js')
    .pipe(concat('infinite-scroll.js'))
    .pipe(gulp.dest('./target'));
});


gulp.task('copy', function(){
  return gulp.src([
    './node_modules/event-emitter/dist/event-emitter.min.js',
    './node_modules/event-emitter/dist/event-emitter.min.js.map',
    './node_modules/imagesready/dist/jquery-imagesready.min.js',
    './node_modules/imagesready/dist/jquery-imagesready.min.js.map'
  ])
    .pipe(gulp.dest('./dist'));
});


gulp.task('coveralls', function() {
  return gulp.src('./tmp/coverage/**/lcov.info')
    .pipe(coveralls());
});


gulp.task('headers', function(){
  var pkg = require('./package.json');
  var headerTemplate = '/* <%= name %> v<%= version %> - <%= date %> - <%= url %> */\n';
  var headerContent = {date: (new Date()).toISOString(), name: pkg.name, version: pkg.version, url: pkg.homepage};

  return gulp.src('./dist/infinite-scroll*.js')
    .pipe(header(headerTemplate, headerContent))
    .pipe(gulp.dest('./dist'));
});


gulp.task('lint', function(){
  return gulp.src('./src/*.js')
    .pipe(eslint({useEslintrc: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('sass', function compileSass(){
  return gulp.src('./examples/*.scss')
    .pipe(sass({
      errLogToConsole: true,
      outputStyle: 'nested',
      precision: 10,
      sourceComments: false
    }))
    .pipe(gulp.dest('./examples'));
});


gulp.task('sync', function(){
  browserSync
    .create()
    .init({
      browser: 'firefox',
      files: ['src/**/*', 'example/**/*.{css,html,js}'],
      port: 7000,
      server: {
        baseDir: '.'
      }
    });
});


gulp.task('test', function(done){
  karma.start({configFile: __dirname + '/karma.conf.js'}, done);
});


gulp.task('uglify', function(){
  return gulp.src('./dist/*.js')
    .pipe(rename(function(path){
      path.basename += ".min";
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('./', {includeContent: true}))
    .pipe(gulp.dest('./dist'));
});


gulp.task('umd', function(){
  var umdHelper = function(){ return 'InfiniteScroll'; };

  return gulp.src('./src/*.js')
    .pipe(concat('infinite-scroll.js'))
    .pipe(umd({exports: umdHelper, namespace: umdHelper}))
    .pipe(gulp.dest('./dist'));
});


gulp.task('build', gulp.series('test', 'clean:dist', 'umd', 'uglify', 'headers', 'copy'));


gulp.task('default', gulp.series('clean:target', 'concat', 'sass', function watch(){
  gulp.watch('./examples/**/*.scss', gulp.task('sass'));
  gulp.watch('./src/**/*.js', gulp.task('concat'));
}));


gulp.task('dist:patch', gulp.series('bump:patch', 'build'));
gulp.task('dist:minor', gulp.series('bump:minor', 'build'));
