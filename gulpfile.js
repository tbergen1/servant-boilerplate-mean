// include gulp
var gulp = require('gulp'),
	gconcat = require('gulp-concat'),
	gzip = require('gulp-gzip'),
	jshint = require('gulp-jshint'),
	csslint = require('gulp-csslint'),
	ngmin = require('gulp-ngmin'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify')
	// , refresh  = require('gulp-livereload')
	,
	lr = require('tiny-lr'),
	spawn = require('child_process').spawn,
	lrServer = lr(),
	node;

// Location Arrays – (Note: The Order in Array is important as it reflects the order of loading...)
var serverjsLocations = ['./app/controllers/*.js', './app/controllers/api/*.js', './app/controllers/api/v1/*.js', './app/lib/*.js', './app/models/*.js', './config/env/*.js', './config/middlewares/*.js', './config/*.js', '*.js'],
	dashboardjsLocations = ['./public/js/dashboard/**/*.js'],
	homejsLocations = ['./public/js/home/**/*.js'],
	alljsLocations = serverjsLocations.concat(dashboardjsLocations, homejsLocations),
	cssLocations = ['./public/css/*.css'];
// , jadeLocations          = ['./app/views/*.jade', './app/views/includes/*.jade', './app/views/layouts/*.jade', './app/views/oauth/*.jade']
// , viewLocations          = ['./public/views/*.html', './public/views/content/*.html', './public/views/content/products/*.html', './public/views/footer/*.html', './public/views/header/*.html', './public/views/modals/*.html'];

// JS hint task
gulp.task('jsLint', function() {
	gulp.src(alljsLocations)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// CSSLint Task
gulp.task('cssLint', function() {
	gulp.src(cssLocations)
		.pipe(csslint())
		.pipe(csslint.reporter());
});

// Build Task
gulp.task('build', function() {
	gulp.src(dashboardjsLocations)
		.pipe(gconcat('dashboard.js'))
		.pipe(ngmin())
		.pipe(rename('dashboard.min.js'))
		.pipe(gulp.dest('./public/dist'))
		.pipe(uglify())
		.pipe(gulp.dest('public/dist'))
		.pipe(gzip())
		.pipe(gulp.dest('public/dist'));
	// .pipe(refresh(lrServer));
	gulp.src(homejsLocations)
		.pipe(gconcat('home.js'))
		.pipe(ngmin())
		.pipe(rename('home.min.js'))
		.pipe(gulp.dest('./public/dist'))
		.pipe(uglify())
		.pipe(gulp.dest('public/dist'))
		.pipe(gzip())
		.pipe(gulp.dest('public/dist'));
	// .pipe(refresh(lrServer));
});

// Server Task
gulp.task('server', function() {
	if (node) node.kill();
	node = spawn('node', ['server.js'], {
		stdio: 'inherit'
	});
	node.on('close', function(code) {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
});


// Watch Statements
gulp.task('default', function() {

	gulp.run('jsLint', 'build', 'server');

	gulp.watch(alljsLocations, function() {
		gulp.run('build', 'server'); // put jsLint back in at some point
	});

	lrServer.listen(35729, function(err) {
		if (err) return console.log(err);
	});

});