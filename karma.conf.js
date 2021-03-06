module.exports = function(config) {

  var options = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Continuous Integration mode: if true, Karma captures browsers, runs the tests and exits
    singleRun: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'fixture'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/event-emitter/dist/event-emitter.js',
      'node_modules/imagesready/src/imagesready.js',
      'src/*.js',
      'test/*.spec.js',
      'test/fixtures/long.html',
      'test/fixtures/page-1.html',
      {pattern: 'test/fixtures/1.jpg', watched: false, included: false, served: true},
      {pattern: 'test/fixtures/page-{2,3}.html', watched: false, included: false, served: true}
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/fixtures/long.html': ['html2js'],
      'test/fixtures/page-1.html': ['html2js']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    reporters: ['dots'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO

  };


  // additional options for coverage
  if (process.argv.indexOf('--coverage') !== -1) {
    options.preprocessors['src/*.js'] = 'coverage';
    options.reporters.push('coverage');
    options.coverageReporter = {
      type : 'lcov',
      dir  : 'tmp/coverage'
    }
  }


  config.set(options);

};
