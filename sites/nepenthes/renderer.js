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
				, montyh : Number( date.getMonth() + 1 )
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
		
				//window.maxPage = -1;
				window.maxPages = [];
				window.pageCnt = 1;
				window._tmp = {}
				window._tmp.cnt = 0;
				window.linkList = [];
				window.linkListKeys = [];
				window.detailList = [];
				window.resultFileList = {};
				window.siteNm = "nepenthes"
				window.siteUrl = "https://nepenthes-onlinestore.com/"
				//window.pageBaseUrl = "https://www.cultizm.com/en/widgets/Listing/ajaxListing?mode=next&c=83&p="
				window.pageBaseUrls = [
					  "https://nepenthes-onlinestore.com/?mode=cate&cbid=1802116&csid=0&sort=n&page="
					, "https://nepenthes-onlinestore.com/?mode=cate&cbid=1802111&csid=0&sort=n&page="
					, "https://nepenthes-onlinestore.com/?mode=cate&cbid=1802115&csid=0&sort=n&page="
					, "https://nepenthes-onlinestore.com/?mode=cate&cbid=1820591&csid=0&sort=n&page="
				]
				window.pageBaseUrlsCnt = 0;
				window.downLoadHtmlCnt = 1;
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){
				//*/
				url = pageBaseUrls[ window.pageBaseUrlsCnt ] + 1;
				webview.loadURL( url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName( "pager" )[0].children[0].innerText;
					Promise.resolve( _el )
				`
				).then(function(data){
					var _data = data.replace("ALL [ ","").replace(" ] ITEMS","") * 1;
					var maxPage = Math.ceil( _data / 12 );
					window.maxPages.push( maxPage );
					console.log( "window.maxPage : " + maxPage );
					if( window.pageBaseUrlsCnt < window.pageBaseUrls.length - 1 )
					{
						debugger;
						++window.pageBaseUrlsCnt;
						window.FNS.getMaxPage( cbFunction )
					}
					else
					{
						debugger;
						window.pageBaseUrlsCnt = 0;
						cbFunction();	
					}
				})
			}
			//-------------------------------------------------------;
			//게시물HTML저장하기;
			//-------------------------------------------------------;
			window.FNS.downloadHtml = function( cbFunction ){
				
				//if( window.maxPage < window.pageCnt )
				//{
				//	cbFunction();
				//	return
				//}

				console.log( "[S] - window.FNS.downloadHtml - " +  window.pageCnt );
				var dirPath = "./html/"
				url = window.pageBaseUrls[ window.pageBaseUrlsCnt ] + window.pageCnt
				
				webview.loadURL( url ).then(function(data){
					webview.executeJavaScript(`
					new Promise((resolve, reject) => {
						var el = window.document.getElementsByClassName( "item_alignment" )[0].innerHTML;
						if( window.document.getElementsByClassName( "item_alignment" )[0].innerText != "" )
						{
							resolve(el);
						}
						else
						{
							resolve( "" );
						}
						
					});
					`
					).then(function(data){

						if( data == "" && window.pageBaseUrlsCnt == window.pageBaseUrls.length - 1 )
						{
							cbFunction();
							return;	
						}
						
						if( data == "" )
						{
							++window.pageBaseUrlsCnt;
							window.pageCnt = 1;
							setTimeout(function(){
								window.FNS.downloadHtml( cbFunction );	
							},250)
						}
						else
						{
							var _data = data;
		
							fs.mkdirSync( dirPath, { recursive: true } );
							fs.writeFileSync( dirPath +	window.downLoadHtmlCnt + ".html", _data, {flag : "w"} )
							++window.downLoadHtmlCnt;
							console.log( "[E] - window.FNS.downloadHtml - " +  window.pageCnt )
							
							++window.pageCnt;
							setTimeout(function(){
								window.FNS.downloadHtml( cbFunction );	
							},1000)	
						}
						
					})
				})
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinksByHTML = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./html/";
				var resultDirPath = "./result/";
				var backupDirPath = "./backup/";
				var prev_ids_filePath = "./prev_json/";
				var list = global.fs.readdirSync( targetDirPath );
				var prev_data = [];

				if( fs.existsSync( prev_ids_filePath + "prev_" + window.siteNm + ".json" ) )
				{
					var prev_data = JSON.parse( global.fs.readFileSync( resultDirPath + "prev_" + window.siteNm + ".json" ).toString() );	
				}

				var r = {};
				var ids = [];
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					var el = window.document.getElementsByClassName("item_box");
					var i = 0, iLen = el.length, io;
					for(;i<iLen;++i){
						io = el[ i ];
		
						var href = io.children[0].children[0].getAttribute("href")
						var _id = href.split("=")
						var id = _id[ _id.length - 1 ];

						r[ id ] = {};
						r[ id ].isNew = 0;
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = window.siteUrl + href;
						//r[ id ].img = io.children[0].children[0].children[0].src.split("?")[0];
						r[ id ].img = io.children[0].children[0].children[0].src;


						r[ id ].nm = "";
						r[ id ].brand = ""
						r[ id ].salePrice = -1;
						r[ id ].msrp = -1;
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [];

						r[ id ].currency = {
							mark : "¥"
							, code : "JPY"
						}

						r[ id ].nm = io.children[1].children[1].innerText;						
						r[ id ].brand = io.children[1].children[0].innerText;
						
						try
						{
							if( io.children[1].children[2].innerText.indexOf("SOLD OUT") == -1 )
							{
								r[ id ].salePrice = Number( io.children[1].children[2].innerText.replace( "円","" ).replace( "(税抜)","" ).replace( /\,/gi,"" ) );
								r[ id ].msrp = Number( io.children[1].children[2].innerText.replace( "円","" ).replace( "(税抜)","" ).replace( /\,/gi,"" ) );								
							}
							else
							{
								r[ id ].isSoldOut = 1;
							}
							
						}
						catch( er )
						{
							debugger;
						}
						
						//r[ id ].html_no = zo;

						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2) * 1;
						}
						
						
						if( prev_data.indexOf( id ) == -1 )
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
						r[ id ].id = id;
						r[ id ]._search_ = 	r[ id ].websiteNm + " " + r[ id ].brand + " " + r[ id ].nm;
					}
				}

				var jsonCnt = 0;

				var r_arr = [];
				var s,so;
				for( s in r )
				{
					so = r[ s ];
					so.id = s;
					r_arr.push( so );
					ids.push( s );
					//debugger;
					if( r_arr.length == 5000 )
					{
						console.log( jsonCnt )
						try
						{
							fs.mkdirSync( resultDirPath, { recursive: true } );

							var newFilePath = resultDirPath + window.siteNm + "_"+ jsonCnt + ".json";
							var backupFilePath = backupDirPath + window.UTIL.DateFormat.YYYYMMDD_HHMMSS() + "_" + window.siteNm + "_"+ jsonCnt + ".json"

							fs.writeFileSync( newFilePath, JSON.stringify( r_arr ,null,4 ), {flag:"w"} );
							fs.writeFileSync( backupFilePath, JSON.stringify( r_arr ,null,4 ), {flag:"w"} );

							++jsonCnt;
							r_arr = []
						
						}
						catch(er)
						{
							console.log( er );
						}		
					}					
				}
			
				try
				{
					console.log( resultDirPath + window.siteNm + "_"+ jsonCnt + ".json" )

					fs.mkdirSync( resultDirPath, { recursive: true } );

					var newFilePath = resultDirPath + window.siteNm + "_"+ jsonCnt + ".json";
					var backupFilePath = backupDirPath + window.UTIL.DateFormat.YYYYMMDD_HHMMSS() + "_" + window.siteNm + "_"+ jsonCnt + ".json"

					fs.writeFileSync( newFilePath, JSON.stringify( r_arr ,null,4 ), {flag:"w"} );
					fs.writeFileSync( backupFilePath, JSON.stringify( r_arr ,null,4 ), {flag:"w"} );

					++jsonCnt;
					r_arr = []
				
				}
				catch(er)
				{
					console.log( er );
				}
			
				var prev_ids_fileNm = window.siteNm + ".json";
				fs.mkdirSync( prev_ids_filePath, { recursive: true } );
				fs.writeFileSync( prev_ids_filePath + prev_ids_fileNm, JSON.stringify( ids ), {flag:"w"} );

				console.log( "[E] - window.FNS.getDetailLinks" )
				if( cbFunction ) cbFunction();
				
			}

			//-------------------------------------------------------;
			//전체로직실행;
			//-------------------------------------------------------;
			window.FNS.FN00 = function(){
				
				console.log( "[ S ] - window.FNS.logics" )
				
				window.FNS.init()
				console.log( "--------------- window.FNS.getMaxPage ---------------" );
				//window.FNS.getMaxPage( function(){
					console.log( "--------------- window.FNS.getMaxPage ---------------" );
					console.log( "--------------- window.FNS.downloadHtml ---------------" );
					
					//var bat = spawn('cmd.exe', ['/c', 'html_data_delete.bat' ]);
					//bat.stdout.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") ); });
					//bat.stderr.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") );	});
					//bat.on('exit', function(code){ console.log(`Child exited with code ${code}`); });

					//window.FNS.downloadHtml(function(){
						console.log( "--------------- window.FNS.downloadHtml ---------------" );
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						window.FNS.getDetailLinksByHTML( function(){
							console.log( "--------------- window.FNS.getDetailLinks ---------------" );
							
							var remote = require('electron').remote
							var w = remote.getCurrentWindow()
							w.close()
							
						})
					//});
				//})
			}

			if( !window.FNS.isLogicStart )
			{
				window.FNS.isLogicStart = 1;
				window.FNS.FN00();
			}
		})
	}
})();