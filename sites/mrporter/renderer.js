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
				window.siteNm = "mrporter"
				window.siteUrl = "https://www.mrporter.com"
				//window.pageBaseUrl = "https://www.mrporter.com/en-kr/mens/clothing?pageNumber=1"
				window.pageBaseUrls = [
					"clothing"
					, "shoes"
					, "accessories"
					, "luxury-watches"
					, "lifestyle"
					, "grooming"
					, "sport"
				]
				window.pageBaseUrls_o = {
					"clothing" : "https://www.mrporter.com/en-kr/mens/clothing/?pageNumber=1"
					, "shoes" : "https://www.mrporter.com/en-kr/mens/shoes/?pageNumber=1"
					, "accessories" : "https://www.mrporter.com/en-kr/mens/accessories/?pageNumber=1"
					, "luxury-watches" : "https://www.mrporter.com/en-kr/mens/luxury-watches/?pageNumber=1"
					, "lifestyle" : "https://www.mrporter.com/en-kr/mens/lifestyle/?pageNumber=1"
					, "grooming" : "https://www.mrporter.com/en-kr/mens/grooming/?pageNumber=1"
					, "sport" : "https://www.mrporter.com/en-kr/mens/sport/?pageNumber=1"
				}
				
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

				var _el = window.document.getElementsByClassName("Pagination7")[0].children[0].lastElementChild.children[1].href
				Promise.resolve( _el )		
				
				`
				).then(function(data){
					var maxPage = window.UTIL.URL.paramToObject( data ).pageNumber * 1
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
				
				if( window.maxPages[ window.pageBaseUrlsCnt ] < window.pageCnt )
				{
					if( window.pageBaseUrlsCnt < window.pageBaseUrls.length  - 1 )
					{
						++window.pageBaseUrlsCnt;
												
						var url = window.pageBaseUrls_o[ pageBaseUrls[ window.pageBaseUrlsCnt ] ];
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
				console.log( "[S] - window.FNS.downloadHtml - " +  window.pageCnt );
				var dirPath = "./json/"
				
				webview.executeJavaScript(`
				new Promise((resolve, reject) => {
					var xhr = new XMLHttpRequest();
						xhr.onload = function() {
						if (xhr.status === 200 || xhr.status === 201) {
							//console.log(JSON.parse(  ));
							resolve( xhr.responseText )
						} else {
							console.error(xhr.responseText);
						}
					};
					xhr.open('GET', 'https://www.mrporter.com/api/inseason/search/resources/store/mrp_kr/productview/byCategory?attrs=true&category=%2F${pageBaseUrls[ window.pageBaseUrlsCnt ]}&locale=en_GB&pageNumber=${window.pageCnt}&pageSize=60');
					xhr.send();
				});
				`
				).then(function(data){

					var _data = data;

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
			window.FNS.getDetailLinksByHTML = function( cbFunction ){
				
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
					var _txt = global.fs.readFileSync( targetDirPath + zo ).toString();
					var txt = _txt.match( /<script>window.state[\s\S]*?>[\s\S]*?<\/script>/gi)[0].split("\n")[0].replace("<script>window.state=","").replace("</script>","")
					var _o = JSON.parse( txt ).plp.listing.visibleProducts[0].products;

					var i = 0, iLen = _o.length, io;
					for(;i<iLen;++i){
						io = _o[ i ];

						var href = io.seo.seoURLKeyword;
						var id = io.seo.seoURLKeyword.split("/").pop()
		
						r[ id ] = {};
						r[ id ].isNew = 0;
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = "https://www.mrporter.com/en-kr/mens/product" + io.seo.seoURLKeyword;
						r[ id ].img = "https://cache.mrporter.com/variants/images/" + id + "/in/w560_q80.jpg"
						
						r[ id ].nm = "";
						r[ id ].brand = ""
						r[ id ].salePrice = -1;
						r[ id ].msrp = -1;
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [];

						r[ id ].currency = {
							mark : "£"
							, code : "GBP"
						}
						
						if( !io.name )
						{
							r[ id ].nm = io.seo.seoURLKeyword.split("/")[ 3 ];
						}
						else
						{
							r[ id ].nm = io.name;	
						}
						
						io.productColours.forEach(function(item){
							r[ id ].info.push( item.labelEN )
						})

						try
						{
							r[ id ].nm.split(" ").forEach(function(item){
								r[ id ].info.push( item )
							})
								
						}
						catch(er)
						{
							debugger;
						}
						
						
						r[ id ].brand = io.designerNameEN;
						r[ id ].info.push( io.designerNameEN );
						
						try
						{
							r[ id ].salePrice = io.price.sellingPrice.amount;
							r[ id ].msrp = io.price.rdSellingPrice.amount;
							
						}
						catch(er)
						{
							r[ id ].msrp = r[ id ].salePrice = -1
						}
						

						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2) * 1;
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
						r[ id ].id = id
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
			
				console.log( "[E] - window.FNS.getDetailLinks" )
				if( cbFunction ) cbFunction();
				
			}
			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
//			window.FNS.getDetailLinksByJSON = function( cbFunction ){
//				
//				console.log( "[S] - window.FNS.getDetailLinks" )
//
//				var targetDirPath = "./json/";
//				var resultDirPath = "./result/";
//				var backupDirPath = "./backup/";
//				var list = global.fs.readdirSync( targetDirPath );
//				var prev_data = {};
//
//				var r = {};
//				var z = 0,zLen=list.length,zo;
//				for(;z<zLen;++z)
//				{
//					zo = list[ z ];
//					var _to = JSON.parse( global.fs.readFileSync( targetDirPath + zo ).toString() );
//
//					var dataArr = _to.results[0].hits;
//					var i = 0, iLen = dataArr.length, io;
//					for(;i<iLen;++i){
//
//						io = dataArr[ i ];
//
//						var href = io.url_key;
//						var id = io.objectID
//						
//						
//						r[ id ] = {};
//						r[ id ].isNew = 0;
//						r[ id ].websiteNm = window.siteNm;
//						r[ id ].url = window.siteUrl + "/kr/" + href + ".html"
//						
//						//https://media.endclothing.com/media/f_auto,q_auto:eco,w_800,h_800/prodmedia/media/catalog/product/2/1/21-10-2019_visvim_deckhandjacket_olive_0119205013026-olv_jd_1x.jpg
//						var imgUrlBase = "https://media.endclothing.com/media/f_auto,q_auto:eco,w_800,h_800/prodmedia/media/catalog/product";
//						r[ id ].img = imgUrlBase + io.small_image;
//						
//						
//						r[ id ].brand = io.brand;
//						r[ id ].nm = io.name;
//						r[ id ].salePrice = io.final_price_12;	
//						r[ id ].msrp = io.full_price_12;
//						
//						
//						r[ id ].saleRatio = -1;
//						r[ id ].isSoldOut = 0;
//						r[ id ].info = [];
//						r[ id ].currency = {
//							mark : "₩"
//							, code : "KRW"
//						}
//						r[ id ].info.push( io.brand )
//						r[ id ].info.push( io.actual_colour )
//						r[ id ].info.push( io.department )
//						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
//						{
//							var salePrice = r[ id ].salePrice;
//							var msrp = r[ id ].msrp;
//							r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2);
//						}
//
//						if( !prev_data[ id ] )
//						{
//							r[ id ].crwaling_date_o = window.UTIL.getDateTimeToObject();
//							r[ id ].isNew = 1;
//						}
//						else
//						{
//							r[ id ].crwaling_date_o = prev_data[ id ].crwaling_date_o;
//							r[ id ].isNew = prev_data[ id ].isNew;
//							if( prev_data[ id ].crwaling_date_o.timeStamp + 36288000 <  r[ id ].crwaling_date_o.timeStamp )
//							{
//								r[ id ].isNew = 0;
//							}
//						}
//						
//					}
//				}
//
//				
//				try
//				{
//					fs.mkdirSync( resultDirPath, { recursive: true } );
//					
//					var newFilePath = resultDirPath + window.siteNm + ".json";
//					var backupFilePath = backupDirPath + window.UTIL.DateFormat.YYYYMMDD_HHMMSS() + "_" + window.siteNm + ".json"
//					
//					fs.writeFileSync( newFilePath, JSON.stringify( r ,null,4 ), {flag:"w"} );
//					fs.writeFileSync( backupFilePath, JSON.stringify( r ,null,4 ), {flag:"w"} );
//
//					window.document.getElementById("_tmp").innerHTML = "";
//					console.log( "[E] - window.FNS.getDetailLinks" )
//					if( cbFunction ) cbFunction();
//				}
//				catch(er)
//				{
//					console.log( er );
//				}
//			}
			
			//-------------------------------------------------------;
			//전체로직실행;
			//-------------------------------------------------------;
			window.FNS.FN00 = function(){
				
				console.log( "[ S ] - window.FNS.logics" )
				
				window.FNS.init()
				console.log( "--------------- window.FNS.getMaxPage ---------------" );
				//window.FNS.getMaxPage( function(){
					//console.log( "--------------- window.FNS.getMaxPage ---------------" );
					
					//var bat = spawn('cmd.exe', ['/c', 'JSON_data_delete.bat' ]);
					//bat.stdout.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") ); });
					//bat.stderr.on('data', function(data){ console.log( iconv.decode( data, "euc-kr") );	});
					//bat.on('exit', function(code){ console.log(`Child exited with code ${code}`); });
					
					//console.log( "--------------- window.FNS.downloadJson ---------------" );
					//window.FNS.downloadJson(function(){
						console.log( "--------------- window.FNS.downloadJson ---------------" );
						console.log( "--------------- window.FNS.getDetailLinksByHTML ---------------" );
						window.FNS.getDetailLinksByHTML( function(){
							console.log( "--------------- window.FNS.getDetailLinksByHTML ---------------" );

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