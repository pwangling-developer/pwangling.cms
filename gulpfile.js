
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var fileinclude = require('gulp-file-include');
var minifycss = require('gulp-clean-css');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var child = require('child_process');
var gutil = require('gulp-util');
var jekyllpath = process.platform === 'win32' ? 'C:/Ruby25-x64/bin/jekyll.bat' : 'jekyll';

// gulp.task('jekyll-build', (code) => {
//     return child.spawn(jekyllpath, ['build'], {stdio: 'inherit'})
//       .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
//       .on('close', code);
// });

// gulp.task('jekyll-build', () => {
//     var jekyll = child.spawn(jekyllpath, ['build']);
//     var jekyllLogger = (buffer) => {
//       buffer.toString()
//         .split(/\n/)
//         .forEach((message) => gutil.log('Jekyll: ' + message));
//     };
//     jekyll.stdout.on('data', jekyllLogger);
//     jekyll.stderr.on('data', jekyllLogger);
//   });

gulp.task('jekyll-build', () => {
  var jekyll = child.spawn(jekyllpath, ['build']);
  var jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };
  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('jekyll-build2', function (gulpCallBack) {
    var jekyll = child.spawn(jekyllpath, ['build'], {stdio: 'inherit'});
    jekyll.on('exit', function(code) {
        gulpCallBack(code === 0 ? null :'ERROR: Jekyll process exited with code: '+code);
    });
});

// gulp.task('jekyll-rebuild', ['jekyll-build2'], function() {
//     browserSync.reload();
// });

// gulp.task('build-html', function() {
//     return gulp.src('./src/html/**/*.html')
//     .pipe(fileinclude())
//     .pipe(gulp.dest('./public'))
//     .pipe(browserSync.stream())
//     .pipe(notify({ message: 'HTML file include task complete' }));
// });

gulp.task('uglify-js', function() {
    return gulp.src('./src/js/collate-main/main.js')
    .pipe(fileinclude())
    .pipe(gulp.dest('./public/js/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Uglify task complete' }));
});

gulp.task('style', function() {
    return gulp.src('./src/scss/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./public/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Styles task complete' }));
});

// Compress all images and move them to /dist/images
gulp.task('compress-images', function() {
    return gulp.src('./src/images/**/*.+(png|jpg|jpeg|gif|svg|ico)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('./public/images'))
        .pipe(notify({ message: 'Compress images task complete'}));
});

// Static Server + watching scss/html files
gulp.task('watch-files', function() {

    browserSync.init({
        server: './public'
    });

    gulp.watch('./src/images/**/*.+(png|jpg|jpeg|gif|svg)', gulp.series('compress-images'));
    gulp.watch('./src/scss/**/*.scss', gulp.series('style'));
    // gulp.watch('./src/html/**/*.md', gulp.series('jekyll-rebuild'));
    // gulp.watch('./src/html/**/*.html', gulp.series('jekyll-rebuild'));
    gulp.watch('./src/js/**/*.js', gulp.series('uglify-js'));
});

// gulp.task('default', ['compress-images', 'watch-files']);