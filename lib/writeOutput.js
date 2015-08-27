var fs            = require('fs');

/*
Write output to file system
*/
function writeOutput(compiler, output, outputFullPath) {
	var json = JSON.stringify(output);
	fs.writeFile(outputFullPath, json, function(err) {
		if (err) {
			compiler.errors.push(new Error('Plugin: Unable to save to ' + outputFullPath));
		}
	});
};

module.exports = writeOutput;
