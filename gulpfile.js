var gulp = require('gulp'),
  useref = require('gulp-useref'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  gulpIf = require('gulp-if'),
  imagemin = require('gulp-imagemin'),
  del = require('del'),
  runSequence = require('run-sequence'),
  shell = require('gulp-shell'),
  sass = require('gulp-sass');

gulp.task('useref', function() {
  return gulp.src('app/index.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', cssnano()))
    // .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('www'));
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*.+(eot|svg|ttf|woff|woff2)')
    .pipe(gulp.dest('www/fonts'));
});

gulp.task('images', function() {
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin({
      interlaced: true
    }))
    .pipe(gulp.dest('www/img'))
});

gulp.task('sass', () => {
  return gulp.src('app/assets/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/css/'));
});

gulp.task('watch', ['sass'], function() {
  gulp.watch('app/assets/scss/**/*.scss', ['sass']);
});

gulp.task('clean:www', function(callback) {
  del(['www/**/*', '!www/img', '!www/img/**/*'], callback);
});

gulp.task('clean', function() {
  return del('www');
});

gulp.task('bundle', function(callback) {
  return runSequence(['images', 'fonts', 'sass'], 'useref',
    callback
  );
});

gulp.task('prepare', function(callback) {
  return runSequence('clean', ['bundle'],
    callback
  );
});

gulp.task('build:ios', function(callback) {
  return runSequence('clean', ['bundle'], 'cordovabuild:ios',
    callback
  );
});

gulp.task('build:android', function(callback) {
  return runSequence('clean', ['bundle'], 'cordovabuild:android',
    callback
  );
});

gulp.task('build:browser', function(callback) {
  return runSequence('clean', ['bundle'], 'cordovabuild:browser',
    callback
  );
});

gulp.task('cordovabuild:ios', shell.task([
  'cordova build ios'
]));

gulp.task('cordovabuild:android', shell.task([
  'cordova build android',
  'cordova run android'
]));

gulp.task('cordovabuild:browser', shell.task([
  'cordova build browser',
  'cordova run browser'
]));
