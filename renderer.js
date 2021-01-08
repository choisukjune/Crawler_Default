(function(){
	global.fs = require( "fs" );
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

		window.UTIL.String = {};
		window.UTIL.String.pad = function(n, width){
		  n = n + '';
		  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
		}


		window.UTIL.DateFormat = {};

		window.UTIL.DateFormat.YYYYMMDD_HHMMSS = function(){
			var date = new Date();
			
			var YYYY = date.getFullYear();
			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );
			var H = window.UTIL.String.pad( date.getHours(), 2 );
			var M = window.UTIL.String.pad( date.getMinutes(), 2 );
			var S = window.UTIL.String.pad( date.getSeconds(), 2 );

			return YYYY + "-" + MM + "-" + DD + " " + H + ":" + M + ":" + S;
		};

		window.UTIL.DateFormat.YYYYMMDD = function(){
			var date = new Date();
			
			var YYYY = date.getFullYear();
			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );

			return YYYY + MM + DD;
		};

		window.UTIL.DateFormat.YYMMDD = function( date ){
			date = date || new Date();
			
			var YYYY = date.getFullYear();
			var YY = YYYY.toString().substr(2)

			var MM = window.UTIL.String.pad( date.getMonth() + 1, 2 );
			var DD = window.UTIL.String.pad( date.getDate(), 2 );
			
			return YY + "." + MM + "." + DD;
		};

		
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
		window.detailList = [];

		window.pageBaseUrl = "https://eomisae.co.kr/index.php?mid=fs&page="
		webview.addEventListener('dom-ready', () => {
		  
			var currentURL = webview.getURL();
			var titlePage = webview.getTitle();
			console.log('currentURL is : ' + currentURL)
			console.log('titlePage is : ' + titlePage)			
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.getMaxPage = function( url ){
				url = url || webview.getURL();
				webview.loadURL( url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("frst_last")[1].href
					Promise.resolve( _el )
				`
				).then(function(data){
					window.maxPage = window.UTIL.URL.paramToObject( data ).page * 1
				})
			}
			//-------------------------------------------------------;
			//게시물HTML저장하기;
			//-------------------------------------------------------;
			window.downloadHtml = function( url ){

				url = url || window.pageBaseUrl + window.pageCnt
				webview.loadURL( url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("card_wrap")[0].innerHTML
					Promise.resolve( _el )
				`
				).then(function(data){

					var _data = data.replace(/\/\/img/gi, "https://img")

					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = _data;

					//window.document.getElementsByClassName("card_content")[0].children[0].children[1].innerText
					//window.document.getElementsByClassName("card_content")[0].children[1].children[0]
					var date = window.document.getElementsByClassName("card_content")[0].children[0].children[1].innerText;
					
					if( Number( date.replace(/\./gi,"") ) < Number( window.YYMMDD_now.replace(/\./gi,"") ) )
					{
						debugger;
						window.document.getElementById("_tmp").innerHTML = "";
					}
					else
					{
						
						fs.writeFileSync( window.pageCnt + ".html", _data, {flag : "w"} )	

						debugger;
						++window.pageCnt;
						window.downloadHtml( window.pageBaseUrl + window.pageCnt )
					}
					
				})
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			//var _tText00 = global.fs.readFileSync( "allStockCode.json" ).toString();
			//window.allStockCode = JSON.parse( _tText00 );
			//var list = global.fs.readdirSync("./all_stock_html/20210105/");
			window.getDetailLinks = function( yyyymmdd ){
				
				window.document.getElementById("_tmp").innerHTML = "";
				window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( "1.html" ).toString();

				var el = window.document.getElementsByClassName("card_content");
				
				var r = [];
				var i = 0, iLen = el.length, io;
				for(;i<iLen;++i){
					io = el[ i ];
					var date = io.children[0].children[1].innerText;
					var href = io.children[1].children[0].href

					if( Number( date.replace(/\./gi,"") ) < Number( window.YYMMDD_now.replace(/\./gi,"") ) ) break;
					
					console.log( date + " - " + href );

					var _to = {
						id : window.UTIL.URL.paramToObject( href ).document_srl
						, url : href
						, img : io.parentElement.children[0].children[0].src
					};
					
					r.push( _to );
				}
				try
				{
					fs.writeFileSync( "1.json", JSON.stringify( r ,null,4 ), {flag:"w"} );	
					window.document.getElementById("_tmp").innerHTML = "";
				}
				catch(er)
				{
					console.log( er );
				}
			
			}

			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			//var _tText00 = global.fs.readFileSync( "allStockCode.json" ).toString();
			//window.allStockCode = JSON.parse( _tText00 );
			//var list = global.fs.readdirSync("./all_stock_html/20210105/");
			window.downloadDetailHtml = function( yyyymmdd ){
				
				debugger;

				if( window.linkList.length == 0 )
				{
					window.linkList = JSON.parse( global.fs.readFileSync( "1.json" ).toString() );
					window._tmp.cnt = 0
				}
				
				if( window.linkList.length == window._tmp.cnt ) return;
				
				webview.loadURL( window.linkList[ window._tmp.cnt ].url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("_bd")[0].innerHTML
					Promise.resolve( _el )
				`
				).then(function(data){

					var _data = data.replace(/\/\/img/gi, "https://img")
					fs.writeFileSync( window.linkList[ window._tmp.cnt ].id + ".html", _data, {flag : "w"} )	

					debugger;
					++window._tmp.cnt;
					window.downloadDetailHtml()
					
				})
			
			}
			
			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			//var _tText00 = global.fs.readFileSync( "allStockCode.json" ).toString();
			//window.allStockCode = JSON.parse( _tText00 );
			//var list = global.fs.readdirSync("./all_stock_html/20210105/");
			window.detailHtmlToObject = function( id ){
				
				debugger;

				if( window.detailList.length == 0 )
				{
					window.detailList = global.fs.readdirSync( "./detail/html/" );
					window._tmp.cnt = 0
				}
				
				var a = []
				var z = 0,zLen = window.detailList.length,zo;
				for(;z<zLen;++z){
					zo = window.detailList[ z ];
				
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( "./detail/html/" + zo ).toString();
					
					var r = {
						id : zo.split(".")[0]
						, info : {}
						, detail : []
					};
					var el00 = window.document.getElementsByTagName("table")[0].children[1].children;
					
					var i = 0,iLen = el00.length,io;
					for(;i<iLen;++i){
						io = el00[ i ].children
						if( io.length == 0 ) continue;
						if( io[ 0 ].children.length > 0 ) io[ 0 ] = io[ 0 ].removeChild( io[ 0 ].childNodes[ 1 ] ); 
						r.info[ io[ 0 ].innerText ] = io[1].innerText;
					}
					
					
					var el01 = window.document.getElementsByTagName("article")[0].children[0].children
					var i = 0,iLen = el01.length,io;
					for(;i<iLen;++i){
						io = el01[ i ]
						debugger;
						r.detail.push( io.outerHTML );
					}
					
					a.push( r );
					window.document.getElementById("_tmp").innerHTML = "";
				}
				
				try
				{
					fs.writeFileSync( "./detail/" + window.YYYYMMDD + ".json", JSON.stringify( a ,null,4 ), {flag:"w"} );	
					
				}
				catch(er)
				{
					console.log( er );
				}
			
			}
		})

	}
})()