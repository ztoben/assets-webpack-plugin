var fs = require('fs');

/*
 Write output to file system
 */
function writeOutput(compiler, output, outputFullPath, cb) {
	var json = JSON.stringify(output, null, 4);
	fs.writeFile(outputFullPath, json, function(err) {
		if (err) {
			compiler.errors.push(new Error('Plugin: Unable to save to ' + outputFullPath));
		}
		cb();
	});
};

module.exports = writeOutput;
