#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs'),
	program = require('commander'),
	cheerio = require('cheerio'),
    rest = require('restler');
    
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://desolate-stream-1735.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
      console.log('Error: ' + result.message);
      process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}

    console.log('Using ' +  instr);
    return instr;
};

var assertUrlExists = function(url) {
    var instr = url.toString();

    console.log('Using ' +  instr);
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerio.load(fs.readFileSync(htmlfile));
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }

	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
};

var checkUrl = function(url, checksfile) {
	rest.get(url).on('complete', function (result, response) {
		  $ = cheerio.load(result);
		  var checks = loadChecks(checksfile).sort();
		  var out = {};
		  for(var ii in checks) {
		      var present = $(checks[ii]).length > 0;
		      out[checks[ii]] = present;
		  }
		  
		  var outJson = JSON.stringify(out, null, 4);
		  console.log(outJson);		  
    });
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
		.option('-u, --url <url_address>', 'URL to HTML file', clone(assertUrlExists))
        .parse(process.argv);
        
    var checkJson;
    
    if (program.file) {
	    checkHtmlFile(program.file, program.checks);
    }

	if (program.url) {
	    checkUrl(program.url, program.checks);
	}
	
	if (!program.file && !program.url) {
		program.help();
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}