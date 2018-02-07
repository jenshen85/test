'use strict'
//plugins
  var   gulp          = require('gulp'),
        browserSync   = require('browser-sync').create(),
        del           = require('del'),
        pixelsToRem   = require('postcss-pixels-to-rem'),
        uglify        = require('gulp-uglify'),
        pngquant      = require('imagemin-pngquant'),
        gP            = require('gulp-load-plugins')(),
        normalize     = require('node-normalize-scss').includePaths;

  var   shell         = require('gulp-shell');

  const gulpWebpack   = require('gulp-webpack'),
        webpack       = require('webpack'),
        webpackConfig = require('./webpack.config.js');
        

  var   config        = {
          mode: {
            symbol: {
              sprite: "../sprite.svg",
              example: {
                dest: '../tmp/spriteSvgDemo.html' // демо html
              }
            }
          }
        };

  const paths         = {
          styles: {
            src:'src/sass/**/*.{scss,sass}',
            dest:'dist/assets/css/'
          },
          scripts: {
            src:'src/js/*.js',
            dest:'dist/assets/js/'
          },
          srcScripts: {
            src: 'src/js/common/**/*.js'
          },
          templates: {
            src:'src/templates/pages/*.pug',
            dest:'dist/'
          },
          srcTemplates: {
            src:'src/templates/**/*.pug'
          },
          svg: {
            src:'src/images/svg/**/*.svg',
            dest:'src/images/img/icons/sprite/'
          },
          svgSprite: {
            src: 'src/images/img/icons/sprite/*.svg',
            dest: 'dist/assets/img/icons/sprite'
          },
          images: {
            src:'src/images/img/**/*.{png,jpeg,jpg,gif,ico}',
            dest:'dist/assets/img/'
          },
          fonts: {
            src:'src/fonts/**/*.*',
            dest:'dist/assets/fonts/'
          }
        };

// pug

  function templates() {
    return gulp.src(paths.templates.src)
    .pipe(gP.plumber({
      errorHandler: gP.notify.onError(function(error) {
        return {
          title: 'Templates',
          message: error.message
        };
      })
    }))
    .pipe(gP.pug({ pretty: true }))
    .pipe(gulp.dest(paths.templates.dest))
    .pipe(browserSync.stream({once: true}));
  };

// styles

  function styles() {

    var plugins = [
      pixelsToRem({
        exclude: [
          "border",
          "border-radius",
          "background-position",
          "left",
          "top",
          "right",
          "bottom",
          // "width",
          // "height",
          "padding",          
          "margin"
        ],
        mediaQueries: false
      })
    ];
    return gulp.src([paths.styles.src])
      .pipe(gP.plumber({
        errorHandler: gP.notify.onError(function(error) {
          return {
            title: 'Styles',
            message: error.message
          };
        })
      }))
      .pipe(gP.sourcemaps.init())
      .pipe(gP.sass({
        outputStyle: 'compressed',
        includePaths: normalize
      }))
      .pipe(gP.concat('main.css'))
      .pipe(gP.postcss(plugins))
      .pipe(gP.autoprefixer({
        browsers: ['last 15 versions'],
        cascade: false
      }))
      .pipe(gP.rename({suffix: '.min'}))
      .pipe(gP.sourcemaps.write())
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream());
  };

// webpack

  function scripts() {
    return gulp.src('src/js/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack)) 
        .pipe(gP.plumber({
          errorHandler: gP.notify.onError(function(error) {
            return {
              title: 'Scripts',
              message: error.message
            };
          })
        }))
        .pipe(gulp.dest(paths.scripts.dest));
  }

// img

  function images() {
    return gulp.src(paths.images.src)
      .pipe(gP.plumber({
        errorHandler: gP.notify.onError(function(error) {
          return {
            title: 'Images',
            message: error.message
          };
        })
      }))
      .pipe(gP.imagemin({use: [pngquant()]}))
      .pipe(gulp.dest(paths.images.dest))
  };

// svg

  function svgSpriteBuild() {
    return gulp.src(paths.svg.src)
    // минифицируем svg
    .pipe(gP.svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // удалить все атрибуты fill, style and stroke в фигурах
    .pipe(gP.cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    // cheerio плагин заменит, если появилась, скобка '&gt;', на нормальную.
    .pipe(gP.replace('&gt;', '>'))
    // build svg sprite
    .pipe(gP.svgSprite(config))
    .pipe(gulp.dest(paths.svg.dest));
  }

  function  svgSprite() {
    return gulp.src(paths.svgSprite.src)
    .pipe(gulp.dest(paths.svgSprite.dest));
  }

// fonts

  function fonts() {
    return gulp.src(paths.fonts.src)
      .pipe(gP.plumber({
        errorHandler: gP.notify.onError(function(error) {
          return {
            title: 'Fonts',
            message: error.message
          };
        })
      }))
      .pipe(gulp.dest(paths.fonts.dest))
  };

// watch

  function watch() {
    gulp.watch([paths.templates.src, paths.srcTemplates.src], templates);
    gulp.watch(paths.styles.src, styles);
    gulp.watch([paths.scripts.src, paths.srcScripts.src], scripts);
    gulp.watch(paths.svg.src, svgSpriteBuild);
    gulp.watch(paths.svgSprite.src, svgSprite);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.fonts.src, fonts);
  };

// serve

  function serve() {
    browserSync.init({
      server: {
        baseDir: './dist/'
      }
    });
    browserSync.watch(['./dist/*.html', './dist/**/*.*'], browserSync.reload);
  };

// clean

  function clean() {
    return del('dist')
  };

// export

  exports.templates       = templates;
  exports.styles          = styles;
  exports.images          = images;
  exports.svgSpriteBuild  = svgSpriteBuild;
  exports.svgSprite       = svgSprite;
  exports.fonts           = fonts;
  exports.clean           = clean;
  exports.watch           = watch;

// folder structure

  gulp.task('src', shell.task([
    'mkdir "src/sass" "src/js" "src/templates" "src/images"',
    'mkdir "src/sass/common" "src/js/common"',
    'mkdir "src/templates/common" "src/templates/pages"',
    'mkdir "src/images/svg" "src/images/img"',
    'mkdir "src/fonts"',
    'touch "src/sass/main.sass" "src/templates/template.pug" "src/js/app.js"',
    'echo @import "normalize";>src/sass/main.sass'
  ]))

//default

  gulp.task('default', gulp.series(
    clean,
    svgSpriteBuild,
    gulp.parallel(fonts, templates, styles, scripts, images, svgSprite),
    gulp.parallel(watch, serve)
  ));