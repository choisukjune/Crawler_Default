(function(){
	global.fs = require( "fs" );
	var execSync = require('child_process').execSync;
	var iconv = require( "iconv-lite" );
	var spawn = require('child_process').spawn;
	
	onload = function(){

		var webview = document.querySelector('webview')

		window.UTIL = {}
		window.UTIL.URL = {}
		window.UTIL.URL.paramToObject = function(url){
			var _t00 = url.split("?")[1].split("&");
			var i = 0,iLen = _t00.length,io;
			var r = {}
			for(;i<iLen;++i){
				io = _t00[ i ];
				var _t = io.split("=")
				r[ _t[0] ] = _t[1];
			}
			return r;
		};

		//-----------------------------------------------------------------;
		//-----------------------------------------------------------------;
		window.UTIL.String = {};
		window.UTIL.String.pad = function(n, width){
		  n = n + '';
		  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
		}

		//-----------------------------------------------------------------;
		//-----------------------------------------------------------------;
		window.UTIL.DateFormat = {};
		window.UTIL.DateFormat.YYYYMMDD_HHMMSS = function(){
			var date = new Date();

			var YYYY = date.getFullYear();
			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );
			var H = window.UTIL.String.pad( date.getHours(), 2 );
			var M = window.UTIL.String.pad( date.getMinutes(), 2 );
			var S = window.UTIL.String.pad( date.getSeconds(), 2 );

			return YYYY + MM + DD + "_" + H +  M + S;
		};

		window.UTIL.DateFormat.YYYYMMDD = function(){
			var date = new Date();

			var YYYY = date.getFullYear();
			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );

			return YYYY + MM + DD;
		};


		window.UTIL.getDateTimeToObject = function(){
			var date = new Date();

			var r = {
				year : Number( date.getFullYear() )
				, montyh : Number( date.getMonth() )
				, day : Number( date.getDate() )
				, hour : Number( date.getHours() )
				, minute : Number( date.getMinutes() )
				, secont : Number( date.getSeconds() )
				, timeStamp : date.getTime()
			}

			return  r;

		}

		window.UTIL.DateFormat.YYMMDD = function( date ){
			date = date || new Date();

			var YYYY = date.getFullYear();
			var YY = YYYY.toString().substr(2)

			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );

			return YY + "." + MM + "." + DD;
		};

		//-----------------------------------------------------------------;
		//-----------------------------------------------------------------;
		window.YYMMDD_now = window.UTIL.DateFormat.YYMMDD();
		window.YYYYMMDD = window.UTIL.DateFormat.YYYYMMDD();
		var oneDayAgo_date = new Date();
		oneDayAgo_date.setDate(oneDayAgo_date.getDate() - 2);
		window.YYMMDD_oneDayAgo = window.UTIL.DateFormat.YYMMDD( oneDayAgo_date );

		window.maxPage = -1;
		window.pageCnt = 1;
		window._tmp = {}
		window._tmp.cnt = 0;
		window.linkList = [];
		window.linkListKeys = [];
		window.detailList = [];
		window.resultFileList = {};

		window.SERVER = {};
		window.SERVER.APISERVER = {};
		window.SERVER.APISERVER.HOST = "http://localhost";
		window.SERVER.APISERVER.PORT = 8888;
		window.SERVER.APISERVER.URL = window.SERVER.APISERVER.HOST + ":" + window.SERVER.APISERVER.PORT;

		window.FNS = {};

		window.FNS.isLogicStart = 0;

		
		webview.addEventListener('did-finish-load', () => {

			// var currentURL = webview.getURL();
			// var titlePage = webview.getTitle();
			// console.log('currentURL is : ' + currentURL)
			// console.log('titlePage is : ' + titlePage)

			//-------------------------------------------------------;
			//로직초기화
			//-------------------------------------------------------;
			window.FNS.init = function(){
				window.YYMMDD_now = window.UTIL.DateFormat.YYMMDD();
				window.YYYYMMDD = window.UTIL.DateFormat.YYYYMMDD();
				var oneDayAgo_date = new Date();
				oneDayAgo_date.setDate(oneDayAgo_date.getDate() - 2);
				window.YYMMDD_oneDayAgo = window.UTIL.DateFormat.YYMMDD( oneDayAgo_date );
		
				window.maxPage = -1;
				window.pageCnt = 1;
				window._tmp = {}
				window._tmp.cnt = 0;
				window.linkList = [];
				window.linkListKeys = [];
				window.detailList = [];
				window.resultFileList = {};
				window.siteNm = "beams"
				window.siteUrl = "https://www.beams.co.jp/"
				window.pageBaseUrl = "https://www.beams.co.jp/search/?sex=M&search=true&p="
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){
				
				//*/
				url = "https://www.beams.co.jp/search/?sex=M&search=true&p=1";
				webview.loadURL( url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("page-number")[0];
					var url = _el.lastElementChild.innerText;
					Promise.resolve( url )
				`
				).then(function(data){
					//window.maxPage = window.UTIL.URL.paramToObject( data ).page * 1;
					window.maxPage = data * 1;
					console.log( "window.maxPage : " + window.maxPage );
					cbFunction();
				})
				
				/*/
				window.maxPage = 65;
				console.log( "window.maxPage : " + window.maxPage );
				cbFunction();
				//*/
			}
			//-------------------------------------------------------;
			//게시물HTML저장하기;
			//-------------------------------------------------------;
			window.FNS.downloadHtml = function( cbFunction ){
								
				if( window.maxPage < window.pageCnt )
				{
					cbFunction();
					return
				}
				console.log( "[S] - window.FNS.downloadHtml - " +  window.pageCnt );
				var dirPath = "./html/"
				url = window.pageBaseUrl + window.pageCnt
				webview.loadURL( url );
				
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("listed-items-4columns")[0].innerHTML
					Promise.resolve( _el )
				`
				).then(function(data){

					var _data = data.replace(/\/\/img/gi, "https://img")

					//window.document.getElementById("_tmp").innerHTML = "";
					//window.document.getElementById("_tmp").innerHTML = _data;

					//window.document.getElementsByClassName("card_content")[0].children[0].children[1].innerText
					//window.document.getElementsByClassName("card_content")[0].children[1].children[0]

					fs.mkdirSync( dirPath, { recursive: true } );
					fs.writeFileSync( dirPath + window.pageCnt + ".html", _data, {flag : "w"} )
					console.log( "[E] - window.FNS.downloadHtml - " +  window.pageCnt )
					
					++window.pageCnt;

					window.FNS.downloadHtml( cbFunction );
					window.document.getElementById("_tmp").innerHTML = "";

				})
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinks = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./html/";
				var resultDirPath = "./result/";
				var backupDirPath = "./backup/";
				var list = global.fs.readdirSync( targetDirPath );
				var prev_data = {};

				if( fs.existsSync( resultDirPath + window.siteNm + ".json" ) )
				{
					var prev_data = JSON.parse( global.fs.readFileSync( resultDirPath + window.siteNm + ".json" ).toString() );	
				}

				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					//var el = window.document.getElementsByClassName("item");
					var el = window.document.getElementsByClassName("beams-list-image-item")
					var i = 0, iLen = el.length, io;
					for(;i<iLen;++i){
						io = el[ i ];

						var href = io.children[0].href;
						var _id = href.split("?")[0].split("/")
						var id = _id[ _id.length - 2 ]

						r[ id ] = {};
						r[ id ].isNew = 0;
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = window.siteUrl + href.replace( "file:///D:", "" )
						r[ id ].img = io.children[0].children[1].children[0].src.replace( "file", "http" ).replace("/S2/", "/O/")

						r[ id ].nm = io.children[0].children[3].getAttribute( "initial-text" ).replace("【予約】","").replace(/\\n/gi,"").replace(/\\t/gi,"").trim();
						var brand = r[ id ].nm.split(" / ")[0];
						
						if( brand.indexOf( "＞" ) != -1 )
						{
							r[ id ].brand = brand.split( "＞" )[ 1 ].trim();
							console.log( "＞ - " + r[ id ].brand )
							
						}
						else if( brand.indexOf( "】" ) != -1 )
						{
							r[ id ].brand = brand.split( "】" )[ 1 ].trim();
							console.log( "】 - " + r[ id ].brand )
							
						}
						else if( brand.indexOf( ">" ) != -1 )
						{
							r[ id ].brand = brand.split( ">" )[ 1 ].trim();
							console.log( "> - " + r[ id ].brand )
							
						}
						else
						{
							r[ id ].brand = brand.trim()
						}

						
						
						r[ id ].salePrice = -1;
						r[ id ].msrp = -1;
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [];
						r[ id ].currency = {
							mark : "¥"
							, code : "JPY"
						}
						
						var j = 0,jLen = io.children[0].children.length,jo;
						for(;j<jLen;++j){
							jo = io.children[0].children[j];
							if( jo.classList.contains("price") && jo.classList.contains("line-through") )
							{
								r[ id ].msrp = Number( jo.innerText.replace( "¥","" ).replace( /\,/gi,"" ) );
							}
							if( jo.classList.contains("price") && !jo.classList.contains("line-through")  )
							{
								r[ id ].salePrice = Number( jo.innerText.replace( "¥","" ).replace( /\,/gi,"" ) )
							}
							if( jo.classList.contains("price") && jo.classList.contains("sale")  )
							{
								r[ id ].salePrice = Number( jo.innerText.split(" ")[0].replace( "¥","" ).replace( /\,/gi,"" ) )
							}
						}
						
						if( r[ id ].msrp == -1 ) r[ id ].msrp = r[ id ].salePrice;

						if( io.children[0].children[0].innerText.indexOf( "SOLDOUT" ) != -1 ) r[ id ].isSoldOut = 1;

						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = parseFloat( (1 -( salePrice / msrp )).toFixed(2) );
						}

						r[ id ].info.push( io.children[0].children[2].innerText );
						if( r[ id ].info.indexOf( r[ id ].brand ) == -1 )
						{
							r[ id ].info.push( r[ id ].brand );
						}
						
						if( !prev_data[ id ] )
						{
							r[ id ].crwaling_date_o = window.UTIL.getDateTimeToObject();
							r[ id ].isNew = 1;
						}
						else
						{
							r[ id ].crwaling_date_o = prev_data[ id ].crwaling_date_o;
							r[ id ].isNew = prev_data[ id ].isNew;
							if( prev_data[ id ].crwaling_date_o.timeStamp + 36288000 <  r[ id ].crwaling_date_o.timeStamp )
							{
								r[ id ].isNew = 0;
							}
						}
						
					}
				}

				try
				{
					fs.mkdirSync( resultDirPath, { recursive: true } );
					
					var newFilePath = resultDirPath + window.siteNm + ".json";
					var backupFilePath = backupDirPath + window.UTIL.DateFormat.YYYYMMDD_HHMMSS() + "_" + window.siteNm + ".json"
					
					fs.writeFileSync( newFilePath, JSON.stringify( r ,null,4 ), {flag:"w"} );
					fs.writeFileSync( backupFilePath, JSON.stringify( r ,null,4 ), {flag:"w"} );

					window.document.getElementById("_tmp").innerHTML = "";
					console.log( "[E] - window.FNS.getDetailLinks" )
					if( cbFunction ) cbFunction();
				}
				catch(er)
				{
					console.log( er );
				}
			}

			//-------------------------------------------------------;
			//전체로직실행;
			//-------------------------------------------------------;
			window.FNS.FN00 = function(){
				
				console.log( "[ S ] - window.FNS.logics" )
				
				window.FNS.init()
				console.log( "--------------- window.FNS.getMaxPage ---------------" );
				window.FNS.getMaxPage( function(){
					console.log( "--------------- window.FNS.getMaxPage ---------------" );
					console.log( "--------------- window.FNS.downloadHtml ---------------" );
					
					var bat = spawn('cmd.exe', ['/c', 'html_data_delete.bat' ]);
					bat.stdout.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") ); });
					bat.stderr.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") );	});
					bat.on('exit', function(code){ console.log(`Child exited with code ${code}`); });

					window.FNS.downloadHtml(function(){
						console.log( "--------------- window.FNS.downloadHtml ---------------" );
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						window.FNS.getDetailLinks( function(){
							console.log( "--------------- window.FNS.getDetailLinks ---------------" );
							
							var remote = require('electron').remote
							var w = remote.getCurrentWindow()
							w.close()
							
						})
					});
				})
			}

			if( !window.FNS.isLogicStart )
			{
				window.FNS.isLogicStart = 1;
				window.FNS.FN00();
			}
		})
	}
})();