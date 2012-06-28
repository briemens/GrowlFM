var http     = require('http')
  , lastResponseData = ''
	, xml2js = require('xml2js')
	, growl = require('crafity.growl')
	, parser = new xml2js.Parser();

process.on('uncaughtException', function (err) {
	console.log("err", err.stack, err);
});

setInterval(function () {
	nowPlaying();
}, 60 * 1000);

function nowPlaying() {
	var client= http.createClient(80, 'ws.audioscrobbler.com')
		, request  = client.request('GET', '/1.0/user/briemens/recenttracks.rss',
															 {'host': 'ws.audioscrobbler.com'})
		, responseData = '';

	request.end();
	request.on('response', function (response) {
		//console.log('STATUS: ' + response.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			//console.log('BODY: ' + chunk);
			responseData += chunk.toString();
		});
		response.on('end', function () {
			if (lastResponseData === responseData) {
				return;
			}
			parser.parseString(responseData, function (err, result) {
				var lastItem = result.channel.item[0];
				//console.log(lastItem.title, lastItem.link);
				lastResponseData = responseData;
				growl.send('Last.fm - Now Playing', lastItem.title, "lastfm-icon.png");
			});
		});
	});
}

nowPlaying();
