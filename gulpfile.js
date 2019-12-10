const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const gulpChanged = require('gulp-changed');
const gulpImagemin = require('gulp-imagemin');
const gulpPostcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const del = require('del');
const { exec } = require('child_process');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: './build/',
    },
  });
}

function clean() {
  return del(['./build/']);
}

function copy() {
  return gulp
    .src(['./src/index.html', './src/assets/others/*'], { base: './src/' })
    .pipe(plumber())
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
}

function css() {
  return gulp
    .src('./src/assets/scss/main.scss')
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(gulpPostcss([autoprefixer()]))
    .pipe(gulpSass())
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src('./src/assets/images/**/*')
    .pipe(plumber())
    .pipe(gulpChanged('./build/assets/images'))
    .pipe(gulpImagemin([
      gulpImagemin.jpegtran({ progressive: true }),
      gulpImagemin.optipng({ optimizationLevel: 5 }),
      gulpImagemin.svgo({
        plugins: [{ removeViewBox: false }],
      }),
    ]))
    .pipe(gulp.dest('./build/assets/images'))
    .pipe(browserSync.stream());
}

function scripts() {
  return exec('parcel build src/index.js --out-dir build/');
}

function watchFiles() {
  gulp.watch(['./src/index.html', './src/assets/others/*'], copy);
  gulp.watch(['./src/assets/scss/**/*.scss'], css);
  gulp.watch(['./src/index.js'], scripts);
  gulp.watch(['./src/assets/images/*.{png,jpg,svg}'], images);
}

gulp.task('copy', copy);
gulp.task('images', images);
gulp.task('scripts', scripts);
gulp.task('watch', gulp.parallel(browsersync, watchFiles));
gulp.task('build', gulp.series(clean, gulp.parallel(copy, css, scripts, images)));
gulp.task('default', gulp.series('build', 'watch'));
