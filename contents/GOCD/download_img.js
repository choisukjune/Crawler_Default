var fs = require('fs');
var http = require('http');    


var http = require('http');
var fs = require('fs');

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
 

var pad = function(n, width){
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

var DateFormat__YYYYMMDD_HHMMSS = function(){
	var date = new Date();

	var YYYY = date.getFullYear();
	var MM = pad( date.getMonth() + 1, 2 );
	var DD = pad( date.getDate(), 2 );
	var H = pad( date.getHours(), 2 );
	var M = pad( date.getMinutes(), 2 );
	var S = pad( date.getSeconds(), 2 );

	return YYYY + "-" + MM + "-" + DD + " " + H + ":" + M + ":" + S;
};

var DateFormat__YYYYMMDD = function(){
	var date = new Date();

	var YYYY = date.getFullYear();
	var MM = pad( date.getMonth() + 1, 2 );
	var DD = pad( date.getDate(), 2 );

	return YYYY + MM + DD;
};

var DateFormat__YYMMDD = function( date ){
	date = date || new Date();

	var YYYY = date.getFullYear();
	var YY = YYYY.toString().substr(2)

	var MM = pad( date.getMonth() + 1, 2 );
	var DD = pad( date.getDate(), 2 );

	return YY + "." + MM + "." + DD;
};




var _o = JSON.parse( fs.readFileSync("./result/GOCD.json").toString() );
/*
{
  websiteNm: 'GOCD',
  url: 'https://cafe.naver.com/casuallydressed/ArticleRead.nhn?clubid=19943558&menuid=80&boardtype=I&page=1&specialmenutype=&articleid=340706&referrerAllArticles=false',
  targetImg: 'http://cafefiles.naver.net/MjAyMTAyMDRfNzUg/MDAxNjEyNDI2Njk1MzUx.obbQVq7o74g9EJx9rm4cVgtKXK0zM2t23T309dSFm9kg.HiV2UgUljydV5IkXxX7sScxUxIMPyp27D3_EXttkz8sg.JPEG/IMG_0674.JPG',
  title: '뉴발도 아식스도 아닌 리복 [23] ',
  nick: '도현도현',
  date: '17:19',
  view: 1186
}
*/

var ids = Object.keys( _o );

var exts = {
	jpg : "jpg"
	, png : "png"
	, jpeg : "jpg"
	, gif : "gif"
}

var idx = 0;
global.destPathFolderNm = DateFormat__YYYYMMDD();
var FN00 = function(){
	console.log( global.destPathFolderNm )
	if( idx == ids.length )
	{
		fs.writeFileSync( "./result/GOCD.json", JSON.stringify( _o,null,4 ),{flag:"w"} )
		return;
		
	}
	var key = ids[ idx ]
	var so = _o[ key ];
	var _tmp = so.targetImg.split("/")
	var tmp = _tmp[ _tmp.length - 1 ].split( "." );
	var ext = exts[ tmp[1].toLowerCase() ];
	var fileNm = key;
	var imgDir = "./thumb/"
	var destPath = imgDir + fileNm + "." + ext;

	if( so.date.indexOf( "." ) != -1 )
	{
		var destPathFolderNm = so.date.replace(/\./gi,"").trim();
	}
	else
	{
		var destPathFolderNm = global.destPathFolderNm;
	}

	//setTimeout(function(){
		//download(so.targetImg, destPath, function(){
			console.log( fileNm + "." + ext + ' - done');
			_o[ key ].img = "/web/img/GOCD/" + fileNm + ".jpg";
			_o[ key ].info = [];
			console.log( _o[ key ].img )
			++idx
			FN00();
		//});
	//},1000)


}

FN00();



