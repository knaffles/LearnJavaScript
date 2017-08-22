var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass())
    .pipe(gulp.dest('public/css'))
});

gulp.task('watch', function(){
  gulp.watch('app/scss/**/*.scss', ['sass']); 
});

gulp.task('copyjquery', function() {
  return gulp.src('node_modules/jquery/dist/jquery.min.js')
  .pipe(gulp.dest('public/js/vendor'))
});

gulp.task('copymustache', function() {
  return gulp.src('node_modules/mustache/mustache.min.js')
  .pipe(gulp.dest('public/js/vendor'))
});

gulp.task('build', [`copymustache`, `copyjquery`], function() {
  console.log('building...');
});