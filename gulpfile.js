var gulp = require('gulp'),
	useref = require('gulp-useref'),
	uglify = require('gulp-uglify'),
	cssnano = require('gulp-cssnano'),
	gulpIf = require('gulp-if'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence'),
	handlebars = require('gulp-handlebars'),
	wrap = require('gulp-wrap'),
	declare = require('gulp-declare'),
	concat = require('gulp-concat'),
	shell = require('gulp-shell'),
	merge = require('merge-stream'),
	path = require('path'),
	cordova = require("cordova-lib").cordova;

gulp.task('useref', function(){
	return gulp.src('app/index.html')
		.pipe(useref())
		.pipe(gulpIf('*.css', cssnano()))
		// .pipe(gulpIf('*.js', uglify()))
		.pipe(gulp.dest('www'));
	});

gulp.task('templates', function() {
	// Assume all partials start with an underscore
	// You could also put them in a folder such as source/templates/partials/*.hbs
	var partials = gulp.src(['app/views/_*.hbs'])
		.pipe(handlebars())
		.pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
			imports: {
				processPartialName: function(fileName) {
					// Strip the extension and the underscore
					// Escape the output with JSON.stringify
					return JSON.stringify(path.basename(fileName, '.js').substr(1));
				}
			}
		}));

	var templates = gulp.src('app/views/**/[^_]*.hbs')
		.pipe(handlebars())
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'MyApp.templates',
			noRedeclare: true // Avoid duplicate declarations
		}));

	// Output both the partials and the templates as build/js/templates.js
	return merge(partials, templates)
		.pipe(concat('templates.js'))
		.pipe(gulp.dest('app/js/'));
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

gulp.task('watch', ['templates'], function(){
	gulp.watch('app/views/*.hbs', ['templates']);
});

gulp.task('clean:www', function(callback){
	del(['www/**/*', '!www/img', '!www/img/**/*'], callback);
});

gulp.task('clean', function() {
	return del('www');
});

gulp.task('bundle', function (callback) {
	return runSequence(['templates', 'images', 'fonts'], 'useref',
		callback
	);
});

gulp.task('prepare', function (callback) {
	runSequence('clean', ['bundle'],
		callback
	);
});

gulp.task('build:android', function (callback) {
	runSequence('clean', ['bundle'], 'cordovabuild:android',
		callback
		);
});

gulp.task('build:ios', function (callback) {
	runSequence('clean', ['bundle'], 'cordovabuild:ios',
		callback
	);
});

gulp.task('build:browser', function (callback) {
	runSequence('clean', ['bundle'], 'cordovabuild:browser',
		callback
	);
});

gulp.task('bamboo', function (callback) {
	runSequence('clean', 'bundle', 'bamboo:prepare', 'package:browser',
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

gulp.task('bamboo:prepare', function (callback) {
	cordova.prepare(callback);
});

gulp.task('app', function (callback) {
	runSequence('clean', 'bundle', 'bamboo:prepare', 'package:ios',
		callback
	);
});

gulp.task('apk', function (callback) {
	runSequence('clean', 'bundle', 'package:android',
		callback
	);
});

gulp.task('package:ios', function (callback) {
	cordova.build({
     "platforms": ["ios"],
     "options": {
         argv: ["--device"]
     }
 }, callback);
});

gulp.task('run:ios', shell.task([
		'cordova run ios --device'
]));

gulp.task('package:android', function (callback) {
	cordova.build({
     "platforms": ["android"],
     "options": {
         argv: ["--release","--gradleArg=--no-daemon"]
     }
 }, callback);
});

gulp.task('package:browser', function (callback) {
    cordova.build({
        "platforms": ["browser"],
        "options": {
            argv: ["--release","--gradleArg=--no-daemon"]
        }
    }, callback);
});

gulp.task('cordovabuild:browser', shell.task([
	'cordova build browser',
	'cordova run browser'
]));