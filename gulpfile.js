"use strict";

const gulp = require("gulp");
const gulpSass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const gulpChanged = require("gulp-changed");
const gulpImagemin = require("gulp-imagemin");
const gulpPostcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const plumber = require('gulp-plumber');
const browserSync = require("browser-sync").create();
const del = require("del");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "./build/"
    }
  });
}

function browsersyncReload() {
  browserSync.reload();
}

function clean() {
  return del(["./build/"]);
}

function copy() {
  return gulp
    .src("./src/*")
    .pipe(plumber())
    .pipe(gulp.dest("./build"))
    .pipe(browserSync.stream());
}

function css() {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(gulpPostcss([autoprefixer()]))
    .pipe(gulpSass())
    .pipe(gulp.dest("./build"))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src("./src/images/**/*")
    .pipe(plumber())
    .pipe(gulpChanged("./build/images"))
    .pipe(
      gulpImagemin([
        gulpImagemin.jpegtran({ progressive: true }),
        gulpImagemin.optipng({ optimizationLevel: 5 }),
        gulpImagemin.svgo({
          plugins: [{ removeViewBox: false }]
        })
      ])
    )
    .pipe(gulp.dest("./build/images"))
    .pipe(browserSync.stream());
}

gulp.task("copy", copy);
gulp.task("images", images);
gulp.task("watch", gulp.parallel(browsersync, watchFiles));
gulp.task("build", gulp.series(clean, gulp.parallel(copy, css, images)));
gulp.task("default", gulp.series("build", "watch"));

function watchFiles() {
  gulp.watch(["./src/index.html"], copy);
  gulp.watch(["./src/scss/**/*.scss"], css);
  gulp.watch(["./src/images/*.{png,jpg,svg}"], images);
}
