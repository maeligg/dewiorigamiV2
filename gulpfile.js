const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const gulpChanged = require('gulp-changed');
const gulpImagemin = require('gulp-imagemin');
const gulpPostcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync').create();
const del = require('del');
const { exec, spawn } = require('child_process');

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './_site/'
    }
  });
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del(['./_site/']);
}

function eleventy() {
  return exec('npx eleventy');
}

function copyStatic() {
  return gulp
    .src(['./src/favicon.png'])
    .pipe(plumber())
    .pipe(gulp.dest('./_site'))
    .pipe(browsersync.stream());
}

function copyOtherAssets() {
  return gulp
    .src(['./src/assets/others/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./_site/assets/others'))
    .pipe(browsersync.stream());
}

function css() {
  return gulp
    .src('./src/assets/scss/main.scss')
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(gulpPostcss([autoprefixer()]))
    .pipe(gulpSass())
    .pipe(gulp.dest('./_site'))
    .pipe(browsersync.stream());
}

function images() {
  return gulp
    .src('./src/assets/images/**/*')
    .pipe(plumber())
    .pipe(gulpChanged('./_site/assets/images'))
    .pipe(gulpImagemin([
      gulpImagemin.jpegtran({ progressive: true }),
      gulpImagemin.optipng({ optimizationLevel: 5 }),
      gulpImagemin.svgo({
        plugins: [{ removeViewBox: false }],
      }),
    ]))
    .pipe(gulp.dest('./_site/assets/images'))
    .pipe(browsersync.stream());
}

function scripts() {
  return exec('parcel build src/index.js --out-dir _site/');
}

function watchFiles() {
  gulp.watch(['./src/**/*.njk'], gulp.series(eleventy, browserSyncReload));
  gulp.watch(['./src/assets/others/*'], gulp.series(copyOtherAssets));
  gulp.watch(['./src/assets/scss/**/*'], gulp.series(css));
  gulp.watch(['./src/index.js'], gulp.series(scripts, browserSyncReload));
  gulp.watch(['./src/assets/images/*.{png,jpg,svg}'], gulp.series(images));
}

const watch = gulp.parallel(browserSync, watchFiles);
const build = gulp.series(clean, gulp.parallel(eleventy, copyStatic, copyOtherAssets, css, scripts, images));

gulp.task('build', gulp.series(build));
gulp.task('start', gulp.series(build, watch));
