const gulp = require('gulp');
const webpack = require('webpack-stream');

function build(cb) {
  // place code for your default task here
  gulp.src('./index.js')
    .pipe(webpack({
    	output: {
    		filename: 'linksys.min.js'
    	}
    }))
    .pipe(gulp.dest('dist/'));
  cb();
}

exports.default = build