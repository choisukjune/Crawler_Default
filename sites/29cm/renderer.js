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

		//window.maxPage = -1;
		window.maxPages = [];
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
		window.FNS.webviewIsLoad = 0;

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
				window.siteNm = "29cm"
				window.siteUrl = "https://www.29cm.co.kr"
				//window.pageBaseUrl = "https://www.endclothing.com/kr/sale?page="
				window.pageBaseUrls = [
					"m_outer"
					, "m_top"
					, "m_bottom"
					, "m_setup"
					, "m_cloth_luxury"
					, "m_bag"
					, "m_shoes"
					, "m_acc"
					, "w_cloth"
					, "w_bag"
					, "w_shoe"
					, "w_acc"
				]
				window.pageBaseUrls_o = {
					"m_outer" : "http://29cm.co.kr/shop/category/list?category_large_code=272100100&category_medium_code=272102100&category_small_code=&sort=latest&page=1&brand=&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&colors="
					, "m_top" : "https://www.29cm.co.kr/shop/category/list?category_large_code=272100100&category_medium_code=272103100&category_small_code=&sort=latest&page=1&brand=&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&colors="
					, "m_bottom" : "https://www.29cm.co.kr/shop/category/list?category_large_code=272100100&category_medium_code=272104100&category_small_code=&sort=latest&page=1&brand=&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&colors="
					, "m_setup" : "https://www.29cm.co.kr/shop/category/list?category_large_code=272100100&category_medium_code=272108100&category_small_code=&sort=latest&page=1&brand=&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&colors="
					, "m_cloth_luxury" : "https://www.29cm.co.kr/shop/category/list?category_large_code=272100100&category_medium_code=272107100"
					, "m_bag" : "https://www.29cm.co.kr/shop/category/list?category_large_code=273100100&category_medium_code=&category_small_code=&sort=latest&page=1&brand=&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&colors="
					, "m_shoes" : "https://www.29cm.co.kr/shop/category/list?category_large_code=274100100&category_medium_code="
					, "m_acc" : "https://www.29cm.co.kr/shop/category/list?category_large_code=275100100&category_medium_code="
					, "w_cloth" : "https://www.29cm.co.kr/shop/category/list?category_large_code=268100100&category_medium_code="
					, "w_bag" : "https://www.29cm.co.kr/shop/category/list?category_large_code=269100100&category_medium_code="
					, "w_shoe" : "https://www.29cm.co.kr/shop/category/list?category_large_code=270100100&category_medium_code="
					, "w_acc" : "https://www.29cm.co.kr/shop/category/list?category_large_code=271100100&category_medium_code="
				}
				/*/
				window.pageApiUrls_o = {
				"m_outer" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272102100&category_small_code=&count=50&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_top" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272103100&category_small_code=&count=50&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_bottom" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272104100&category_small_code=&count=50&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_setup" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272108100&category_small_code=&count=50&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				}
				/*/
				window.pageApiUrls_o = {
				"m_outer" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272102100&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_top" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272103100&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_bottom" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272104100&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_setup" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272108100&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_cloth_luxury" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=272100100&category_medium_code=272107100&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_bag" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=273100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_shoes" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=274100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "m_acc" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=275100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "w_cloth" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=268100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "w_bag" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=269100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "w_shoe" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=270100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="
				, "w_acc" : "https://apihub.29cm.co.kr/nsearch/category-list/?category_large_code=271100100&category_medium_code=&category_small_code=&count=1000&page=<!=PAGE=!>&min_price=&max_price=&is_free_shipping=&is_discount=&is_soldout=&brand=&sort=latest&init=T&colors="

				}
				//*/
				window.pageBaseUrlsCnt = 0;
				window.downLoadHtmlCnt = 1;
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){

				url = window.pageBaseUrls_o[ pageBaseUrls[ window.pageBaseUrlsCnt ] ];
				var category = pageBaseUrls[ window.pageBaseUrlsCnt ];

				webview.loadURL( url );
				webview.executeJavaScript(`

				
					new Promise((resolve, reject) => {
					var _el = window.document.getElementsByClassName("custom-pagination ng-star-inserted")[0]
					var el = _el.children[ _el.children.length - 2 ].innerText;
					resolve( el );
					})	
				
				
				`
				).then(function(data){
					var maxPage = data * 1;
					window.maxPages.push( maxPage );
					console.log( "window.maxPage : " + maxPage );
					if( window.pageBaseUrlsCnt < window.pageBaseUrls.length - 1 )
					{
						++window.pageBaseUrlsCnt;
						setTimeout(function(){
							window.FNS.getMaxPage( cbFunction )
						},1000)
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
			// window.FNS.downloadHtml = function( cbFunction ){
				
			// 	if( window.maxPage < window.pageCnt )
			// 	{
			// 		cbFunction();
			// 		return
			// 	}

			// 	console.log( "[S] - window.FNS.downloadHtml - " +  window.pageCnt );
			// 	var dirPath = "./html/"
			// 	url = window.pageBaseUrl + window.pageCnt
				
			// 	webview.loadURL( url ).then(function(data){
			// 		webview.executeJavaScript(`
			// 		//window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
			// 		function scrollToSmoothly(pos, time){
			// 			/*Time is only applicable for scrolling upwards*/
			// 			/*Code written by hev1*/
			// 			/*pos is the y-position to scroll to (in pixels)*/
			// 				 if(isNaN(pos)){
			// 				  throw "Position must be a number";
			// 				 }
			// 				 if(pos<0){
			// 				 throw "Position can not be negative";
			// 				 }
			// 				var currentPos = window.scrollY||window.screenTop;
			// 				if(currentPos<pos){
			// 				if(time){
			// 					var x;
			// 				  var i = currentPos;
			// 				  x = setInterval(function(){
			// 					 window.scrollTo(0, i);
			// 					 i += 50;
			// 					 if(i>=pos){
			// 					  clearInterval(x);
			// 					 }
			// 				 }, time);
			// 				} else {
			// 				var t = 10;
			// 				   for(let i = currentPos; i <= pos; i+=10){
			// 				   t+=10;
			// 					setTimeout(function(){
			// 					  window.scrollTo(0, i);
			// 					}, t/2);
			// 				  }
			// 				  }
			// 				} else {
			// 				time = time || 2;
			// 				   var i = currentPos;
			// 				   var x;
			// 				  x = setInterval(function(){
			// 					 window.scrollTo(0, i);
			// 					 i -= 10;
			// 					 if(i<=pos){
			// 					  clearInterval(x);
			// 					 }
			// 				 }, time);
			// 				  }
			// 			}
			// 			scrollToSmoothly( document.body.scrollHeight, 1 )
			// 		`
			// 		).then(function(){
			// 			setTimeout(function(){
			// 				webview.executeJavaScript(`

			// 				var _el = window.document.getElementsByClassName("PlpContainer__PlpGrid-sc-1i8rrbf-4")[0].innerHTML
			// 				Promise.resolve( _el )
			// 			`
			// 			).then(function(data){

			// 				//var _data = data.replace(/\/\/img/gi, "https://img")
			// 				var _data = data;

			// 				// window.document.getElementById("_tmp").innerHTML = "";
			// 				// window.document.getElementById("_tmp").innerHTML = _data;

			// 				//window.document.getElementsByClassName("card_content")[0].children[0].children[1].innerText
			// 				//window.document.getElementsByClassName("card_content")[0].children[1].children[0]

			// 				fs.mkdirSync( dirPath, { recursive: true } );
			// 				fs.writeFileSync( dirPath + window.pageCnt + ".html", _data, {flag : "w"} )
			// 				console.log( "[E] - window.FNS.downloadHtml - " +  window.pageCnt )
							
			// 				++window.pageCnt;

			// 				//setTimeout(function(){
			// 					window.FNS.downloadHtml( cbFunction );
			// 				//},100)
			// 				//window.document.getElementById("_tmp").innerHTML = "";

			// 			})
			// 			},5000)

			// 		})
			// 		});
			// }

			window.FNS.downloadJson = function( cbFunction ){
				
//				if( window.maxPages[ window.pageBaseUrlsCnt ] < window.pageCnt )
//				{
//					if( window.pageBaseUrlsCnt < window.pageBaseUrls.length  - 1 )
//					{
//						++window.pageBaseUrlsCnt;
//						
//						var url = window.pageBaseUrls_o[ window.pageBaseUrls[ window.pageBaseUrlsCnt ] ];
//						webview.loadURL( url );
//						
//						window.pageCnt = 1;
//						return window.FNS.downloadJson( cbFunction )
//					}
//					else
//					{
//						cbFunction();
//						return;
//					}
//				}
				var _api_url = window.pageApiUrls_o[ window.pageBaseUrls[ window.pageBaseUrlsCnt ] ];
				var api_url = _api_url.replace( "<!=PAGE=!>", window.pageCnt.toString() )  
				console.log( "[S] - window.FNS.downloadJspn - " +  window.pageCnt );
				var dirPath = "./json/"
				var xhr_page = window.pageCnt - 1;

				webview.executeJavaScript(`
				new Promise((resolve, reject) => {
					var xhr = new XMLHttpRequest();
					xhr.onload = function() {
					if (xhr.status === 200 || xhr.status === 201) {
						//console.log(JSON.parse( xhr.responseText ));
						resolve( xhr.responseText )
					} else {
						console.error(xhr.responseText);
					}
					};
					xhr.open('GET', '${api_url}')
					xhr.send(); // 데이터를 stringify해서 보냄
				});
				`
				).then(function(data){
					
					var _data = data;
					var _data_o = JSON.parse( data );
debugger;
					//if( window.maxPages[ window.pageBaseUrlsCnt ] < window.pageCnt )
					if( _data_o.products.length == 0 )
					{
						if( window.pageBaseUrlsCnt < window.pageBaseUrls.length  - 1 )
						{
							++window.pageBaseUrlsCnt;
							
							var url = window.pageBaseUrls_o[ window.pageBaseUrls[ window.pageBaseUrlsCnt ] ];
							webview.loadURL( url );
							
							window.pageCnt = 1;
							return window.FNS.downloadJson( cbFunction )
						}
						else
						{
							cbFunction();
							return;
						}
					}


					fs.mkdirSync( dirPath, { recursive: true } );
					fs.writeFileSync( dirPath + window.downLoadHtmlCnt + ".json", _data, {flag : "w"} )
					console.log( "[E] - window.FNS.downloadJspn - " +  window.pageCnt )
					
					++window.pageCnt;
					++window.downLoadHtmlCnt;

					setTimeout(function(){
						window.FNS.downloadJson( cbFunction );
					},1000)
					
				})
				
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			// window.FNS.getDetailLinksByHTML = function( cbFunction ){
				
			// 	console.log( "[S] - window.FNS.getDetailLinks" )

			// 	var targetDirPath = "./html/";
			// 	var resultDirPath = "./result/";
			// 	var list = global.fs.readdirSync( targetDirPath );
			// 	var brandObj = JSON.parse( global.fs.readFileSync( "brand.json" ).toString());
			// 	var brandArr = Object.keys( brandObj );


			// 	var getBrandNm = function(nm){
			// 		var r = "";
					
			// 		var arr =  nm.split(" ");
					
			// 		var _tNm = []
			// 		var i = 0,iLen = arr.length,io
			// 		for(;i<iLen;++i){
			// 			io = arr[i]
			// 			_tNm.push( io );
			// 			//console.log( brandArr.indexOf( _tNm.join( " " ) ) )
			// 			if( brandArr.indexOf( _tNm.join( " " ) ) != -1)
			// 			{
			// 				r = brandArr[ brandArr.indexOf( _tNm.join( " " ) ) ];	
			// 			}
			// 		}
			// 		return r;
			// 	}


			// 	var r = {};
			// 	var z = 0,zLen=list.length,zo;
			// 	for(;z<zLen;++z)
			// 	{
			// 		zo = list[ z ];
			// 		window.document.getElementById("_tmp").innerHTML = "";
			// 		window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

			// 		var el = window.document.getElementById("_tmp").children
			// 		var i = 0, iLen = el.length, io;
			// 		for(;i<iLen;++i){
			// 			io = el[ i ];

			// 			var href = io.href
			// 			var _id = href.split("/")
			// 			var id = _id[ _id.length - 1 ].split(".")[0]
						
			// 			r[ id ] = {};
			// 			r[ id ].websiteNm = window.siteNm;
			// 			r[ id ].url = window.siteUrl + href.replace( "file:///D:", "" )
			// 			r[ id ].currency = {
			// 				mark : "₩"
			// 				, code : "KRW"
			// 			}
						
			// 			try {
			// 				r[ id ].img = io.children[0].children[0].children[0].src.replace( "file:///D:", "" )	
			// 			} catch (error) {
			// 				if( r[id].img == "/workspace_csj/crawler_sale_data/sites/endclothing/index.html" )
			// 				{
			// 					debugger;
			// 				}
			// 				debugger	
			// 			}
						
						
			// 			r[ id ].brand = getBrandNm( io.children[0].children[1].innerText );
			// 			r[ id ].nm = io.children[0].children[1].innerText;
			// 			try {
			// 				r[ id ].salePrice = Number( io.children[0].children[3].children[1].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );	
			// 				r[ id ].msrp = Number(io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );
			// 			} catch (error) {
			// 				r[ id ].salePrice = Number( io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );	
			// 				r[ id ].msrp = Number(io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );
			// 			}
						
						
			// 			r[ id ].saleRatio = -1;
			// 			r[ id ].isSoldOut = 0;
			// 			r[ id ].info = [ io.children[0].children[2].innerText ];
						
			// 			//if( r[ id ].nm.indexOf( " x " != -1 ) ){
			// 			//	var _tNm = r[ id ].nm.split( " " )
			// 			//	
			// 			//	var collabor = _tNm[0] + " " + _tNm[1] + " " + _tNm[2];
			// 		//		r[ id ].info.push( collabor );
							
							
			// 		//	}

			// 			if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
			// 			{
			// 				var salePrice = r[ id ].salePrice;
			// 				var msrp = r[ id ].msrp;
			// 				r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2);
			// 			}
						
			// 		}
			// 	}

				
			// 	try
			// 	{
			// 		fs.mkdirSync( resultDirPath, { recursive: true } );
			// 		fs.writeFileSync( resultDirPath + window.siteNm + ".json", JSON.stringify( r ,null,4 ), {flag:"w"} );
			// 		window.document.getElementById("_tmp").innerHTML = "";
			// 		console.log( "[E] - window.FNS.getDetailLinks" )
			// 		if( cbFunction ) cbFunction();
			// 	}
			// 	catch(er)
			// 	{
			// 		console.log( er );
			// 	}
			// }
			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinksByJSON = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./json/";
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
					var _to = JSON.parse( global.fs.readFileSync( targetDirPath + zo ).toString() );

					var dataArr = _to.products;
					var i = 0, iLen = dataArr.length, io;
					for(;i<iLen;++i){

						io = dataArr[ i ];

						//var href = io.url_key;
						var id = io.item_no
						if( io.front_brand_name_eng == null )
						{
							debugger;
							continue;
						}
						
						if( r[ id ] ) continue;

						r[ id ] = {};
						r[ id ].isNew = 0;
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = window.siteUrl + "/product/" + id;
						//https://www.29cm.co.kr/product/1012293
						
						var imgUrlBase = "http://img.29cm.co.kr";
						r[ id ].img = imgUrlBase + io.detail_image_url_1 + "?width=500";
						//img.29cm.co.kr/next-product/2021/03/09/7cd42337c3964d6e98b489f061820a46_20210309125317.jpg?width=500
						
						r[ id ].brand = io.front_brand_name_eng;
						r[ id ].nm = io.item_name;

						r[ id ].salePrice = io.sell_price;	
						r[ id ].msrp = io.consumer_price;

						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						
						if( io.is_soldout == "T" )
						{
							r[ id ].isSoldOut = 1;
						}
						r[ id ].info = [];
						
						r[ id ].currency = {
							mark : "₩"
							, code : "KRW"
						}
						
						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = Number((1 -( salePrice / msrp )).toFixed(2));
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
					
					//var bat = spawn('cmd.exe', ['/c', 'JSON_data_delete.bat' ]);
					//bat.stdout.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") ); });
					//bat.stderr.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") );	});
					//bat.on('exit', function(code){ console.log(`Child exited with code ${code}`); });
					
					console.log( "--------------- window.FNS.downloadJson ---------------" );
					//window.FNS.downloadJson(function(){
						console.log( "--------------- window.FNS.downloadJson ---------------" );
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						window.FNS.getDetailLinksByJSON( function(){
							console.log( "--------------- window.FNS.getDetailLinks ---------------" );

							//const remote = require('electron').remote
							//let w = remote.getCurrentWindow()
							//w.close()
							
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