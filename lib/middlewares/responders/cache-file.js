var log = require('../../log');
var respondFromWebFile =require('./web-file');
var fs = require('fs');
var mkdirp = require('mkdirp');
var jsonfile = require('jsonfile');

function respondAndCacheFromWebFile(fileURL, filePath, req, res, next) {

	// force encoding header so that it is not gzipped
	req.headers['Accept-Encoding'] = 'deflate, sdch';

	respondFromWebFile(fileURL, req, res, next, function(data, remoteRes) {

		// ensure folder before writing
		var fileFolder = filePath.replace(/\/[^\/]*$/, '');

		try {
			mkdirp.sync(fileFolder);
			fs.createWriteStream(filePath).write(data);
		} catch(err) {
			// throw err;
			log.error(err.message + ' for (' + filePath + ') from (' + fileURL +')');
		}

		// Delete content-length key so that you can modify content without issues
		if(remoteRes.headers['content-length']) {
			delete remoteRes.headers['content-length'];
		}
		// add headers
		jsonfile.writeFile(filePath+'.headers', remoteRes.headers, function (err) {
			if(err) {
				log.error(err.message + ' for (' + filePath + ') from (' + fileURL +')');
			}
		});

	});

}


module.exports = respondAndCacheFromWebFile;

