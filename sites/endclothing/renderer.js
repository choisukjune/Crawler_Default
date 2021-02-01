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
		
				window.maxPage = -1;
				window.pageCnt = 1;
				window._tmp = {}
				window._tmp.cnt = 0;
				window.linkList = [];
				window.linkListKeys = [];
				window.detailList = [];
				window.resultFileList = {};
				window.siteNm = "endclothing"
				window.siteUrl = "https://www.endclothing.com"
				window.pageBaseUrl = "https://www.endclothing.com/kr/sale?page="
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){
				url = "https://www.endclothing.com/kr/sale?page=1";
				webview.loadURL( url );
				webview.executeJavaScript(`
				var _el = window.document.getElementsByClassName("Toolbar__ProductCount-sc-14b11kg-3")[0].children[0].innerText
					Promise.resolve( _el )
				`
				).then(function(data){
					window.maxPage = ( parseInt(( data * 1 ) / 120) ) + 1;
					console.log( "window.maxPage : " + window.maxPage );
					cbFunction();
				})
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
				
				webview.loadURL( url ).then(function(data){
					webview.executeJavaScript(`
					//window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
					function scrollToSmoothly(pos, time){
						/*Time is only applicable for scrolling upwards*/
						/*Code written by hev1*/
						/*pos is the y-position to scroll to (in pixels)*/
							 if(isNaN(pos)){
							  throw "Position must be a number";
							 }
							 if(pos<0){
							 throw "Position can not be negative";
							 }
							var currentPos = window.scrollY||window.screenTop;
							if(currentPos<pos){
							if(time){
								var x;
							  var i = currentPos;
							  x = setInterval(function(){
								 window.scrollTo(0, i);
								 i += 50;
								 if(i>=pos){
								  clearInterval(x);
								 }
							 }, time);
							} else {
							var t = 10;
							   for(let i = currentPos; i <= pos; i+=10){
							   t+=10;
								setTimeout(function(){
								  window.scrollTo(0, i);
								}, t/2);
							  }
							  }
							} else {
							time = time || 2;
							   var i = currentPos;
							   var x;
							  x = setInterval(function(){
								 window.scrollTo(0, i);
								 i -= 10;
								 if(i<=pos){
								  clearInterval(x);
								 }
							 }, time);
							  }
						}
						scrollToSmoothly( document.body.scrollHeight, 1 )
					`
					).then(function(){
						setTimeout(function(){
							webview.executeJavaScript(`

							var _el = window.document.getElementsByClassName("PlpContainer__PlpGrid-sc-1i8rrbf-4")[0].innerHTML
							Promise.resolve( _el )
						`
						).then(function(data){

							//var _data = data.replace(/\/\/img/gi, "https://img")
							var _data = data;

							// window.document.getElementById("_tmp").innerHTML = "";
							// window.document.getElementById("_tmp").innerHTML = _data;

							//window.document.getElementsByClassName("card_content")[0].children[0].children[1].innerText
							//window.document.getElementsByClassName("card_content")[0].children[1].children[0]

							fs.mkdirSync( dirPath, { recursive: true } );
							fs.writeFileSync( dirPath + window.pageCnt + ".html", _data, {flag : "w"} )
							console.log( "[E] - window.FNS.downloadHtml - " +  window.pageCnt )
							
							++window.pageCnt;

							//setTimeout(function(){
								window.FNS.downloadHtml( cbFunction );
							//},100)
							//window.document.getElementById("_tmp").innerHTML = "";

						})
						},5000)

					})
					});
			}

			window.FNS.downloadJson = function( cbFunction ){
				
				if( window.maxPage < window.pageCnt )
				{
					cbFunction();
					return
				}

				console.log( "[S] - window.FNS.downloadJspn - " +  window.pageCnt );
				var dirPath = "./json/"
				var xhr_page = window.pageCnt - 1;
				webview.executeJavaScript(`
				new Promise((resolve, reject) => {
					var xhr = new XMLHttpRequest();
					var param = encodeURI('userToken=anonymous-2f0e9c24-2d43-4500-af43-73b483222a0a&analyticsTags=["browse","web","v2",kr","KR","sale"]&page=${xhr_page}&facetFilters=[["categories:Sale"],["websites_available_at:12"]]&filters=&facets=["websites_available_at"]&hitsPerPage=120&ruleContexts=["browse","web","v2","kr","KR","sale"]&clickAnalytics=false')
					var data = {
						"requests":[
							{
								"indexName":"catalog_products_en_stock",
								"params":param
							}
						]
					};
					xhr.onload = function() {
					  if (xhr.status === 200 || xhr.status === 201) {
						//console.log(JSON.parse(  ));
						resolve( xhr.responseText )
					  } else {
						console.error(xhr.responseText);
					  }
					};
					xhr.open('POST', 'https://ko4w2gbink-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(3.35.1)%3B%20Browser&x-algolia-application-id=KO4W2GBINK&x-algolia-api-key=dfa5df098f8d677dd2105ece472a44f8');
							 // https://ko4w2gbink-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(3.35.1)%3B%20Browser&x-algolia-application-id=KO4W2GBINK&x-algolia-api-key=dfa5df098f8d677dd2105ece472a44f8
					xhr.setRequestHeader('Content-Type', 'application/json'); // 컨텐츠타입을 json으로
					xhr.send(JSON.stringify( data )); // 데이터를 stringify해서 보냄
				});
				`
				).then(function(data){

					var _data = data;

					fs.mkdirSync( dirPath, { recursive: true } );
					fs.writeFileSync( dirPath + window.pageCnt + ".json", _data, {flag : "w"} )
					console.log( "[E] - window.FNS.downloadJspn - " +  window.pageCnt )
					
					++window.pageCnt;

					window.FNS.downloadJson( cbFunction );

				})
				
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinksByHTML = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./html/";
				var resultDirPath = "./result/";
				var list = global.fs.readdirSync( targetDirPath );
				var brandObj = JSON.parse( global.fs.readFileSync( "brand.json" ).toString());
				var brandArr = Object.keys( brandObj );


				var getBrandNm = function(nm){
					var r = "";
					//debugger;
					
					var arr =  nm.split(" ");
					
					var _tNm = []
					var i = 0,iLen = arr.length,io
					for(;i<iLen;++i){
						io = arr[i]
						_tNm.push( io );
						//console.log( brandArr.indexOf( _tNm.join( " " ) ) )
						if( brandArr.indexOf( _tNm.join( " " ) ) != -1)
						{
							r = brandArr[ brandArr.indexOf( _tNm.join( " " ) ) ];	
						}
					}
					return r;
				}


				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					var el = window.document.getElementById("_tmp").children
					var i = 0, iLen = el.length, io;
					for(;i<iLen;++i){
						io = el[ i ];

						var href = io.href
						var _id = href.split("/")
						var id = _id[ _id.length - 1 ].split(".")[0]
						
						r[ id ] = {};
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = window.siteUrl + href.replace( "file:///D:", "" )
						r[ id ].currency = {
							mark : "₩"
							, code : "KRW"
						}
						
						try {
							r[ id ].img = io.children[0].children[0].children[0].src.replace( "file:///D:", "" )	
						} catch (error) {
							if( r[id].img == "/workspace_csj/crawler_sale_data/sites/endclothing/index.html" )
							{
								debugger;
							}
							debugger	
						}
						
						
						r[ id ].brand = getBrandNm( io.children[0].children[1].innerText );
						r[ id ].nm = io.children[0].children[1].innerText;
						try {
							r[ id ].salePrice = Number( io.children[0].children[3].children[1].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );	
							r[ id ].msrp = Number(io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );
						} catch (error) {
							r[ id ].salePrice = Number( io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );	
							r[ id ].msrp = Number(io.children[0].children[3].children[0].innerText.replace( "₩","" ).replace( /\,/gi,"" ) );
						}
						
						
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [ io.children[0].children[2].innerText ];
						
						//if( r[ id ].nm.indexOf( " x " != -1 ) ){
						//	var _tNm = r[ id ].nm.split( " " )
						//	
						//	var collabor = _tNm[0] + " " + _tNm[1] + " " + _tNm[2];
					//		r[ id ].info.push( collabor );
							
							
					//	}

						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2);
						}
						
					}
				}

				
				try
				{
					fs.mkdirSync( resultDirPath, { recursive: true } );
					fs.writeFileSync( resultDirPath + window.siteNm + ".json", JSON.stringify( r ,null,4 ), {flag:"w"} );
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
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinksByJSON = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./json/";
				var resultDirPath = "./result/";
				var list = global.fs.readdirSync( targetDirPath );

				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					var _to = JSON.parse( global.fs.readFileSync( targetDirPath + zo ).toString() );

					var dataArr = _to.results[0].hits;
					var i = 0, iLen = dataArr.length, io;
					for(;i<iLen;++i){
						debugger;
						io = dataArr[ i ];

						var href = io.url_key;
						var id = io.objectID
						
						
						r[ id ] = {};
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = window.siteUrl + "/kr/" + href + ".html"
						
						//https://media.endclothing.com/media/f_auto,q_auto:eco,w_800,h_800/prodmedia/media/catalog/product/2/1/21-10-2019_visvim_deckhandjacket_olive_0119205013026-olv_jd_1x.jpg
						var imgUrlBase = "https://media.endclothing.com/media/f_auto,q_auto:eco,w_800,h_800/prodmedia/media/catalog/product";
						r[ id ].img = imgUrlBase + io.small_image;
						
						
						r[ id ].brand = io.brand;
						r[ id ].nm = io.name;
						r[ id ].salePrice = io.final_price_12;	
						r[ id ].msrp = io.full_price_12;
						
						
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [];
						r[ id ].currency = {
							mark : "₩"
							, code : "KRW"
						}
						r[ id ].info.push( io.brand )
						r[ id ].info.push( io.actual_colour )
						r[ id ].info.push( io.department )
						if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
						{
							var salePrice = r[ id ].salePrice;
							var msrp = r[ id ].msrp;
							r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2);
						}
						
					}
				}

				
				try
				{
					fs.mkdirSync( resultDirPath, { recursive: true } );
					fs.writeFileSync( resultDirPath + window.siteNm + ".json", JSON.stringify( r ,null,4 ), {flag:"w"} );
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
			//게시물상세페이지HTML 추출 및 저장하기;
			//-------------------------------------------------------;
			/*
			 {
				"websiteNm": "espionage",
				"url": "http://espionage.co.kr/shop/shopdetail.html?branduid=76078&xcode=061&mcode=001&scode=001&type=X&sort=manual&cur_code=061&GfDT=bm9%2BW1g%3D",
				"img": "http://espionage.co.kr/shopimages/zooyork77/0610010000252.jpg?1357903799",
				"brand": "",
				"nm": [
					"Colby Heavy Down Parka Dark G"
				],
				"salePrice": null,
				"msrp": "329,000원"
			},
			*/
			window.FNS.resultJsonToHtml = function(){
				console.log( "[S] - window.FNS.resultJsonToHtml" )
				
				var targetFilePath = targetFilePath || "./result/" + window.siteNm + ".json";
				var resultDirPath = resultDirPath || "../../../HttpServer_Default/html/";;

				var _to = JSON.parse( global.fs.readFileSync( targetFilePath ).toString() );

				var r = `
				`;
				var z,zo;
				for( z in _to ){
					zo = _to[ z ];

					var thmbnail = zo.img;
					var title = zo.nm;
					var href = zo.url;
					var websiteNm = zo.websiteNm
					var brand = zo.brand
					var salePrice = zo.salePrice
					var msrp = zo.msrp

					//r += "<td>내용</td><td>" + io.detail.join("\n").replace( /rel\=\"xe_gallery\"/gi, "width='200'" ) + "</td>"
					//${description}
					r += `
					<div class="card">
						<div class="image">
						<img src="${thmbnail}">
						</div>
						<div class="content">
						<div class="header">${title}</div>
						<div class="meta">
							<a>${websiteNm}</a>
						</div>

						<div class="description" style="font-size:11px;word-break: break-all;">
							${brand}<br>
							${salePrice}<br>
							${msrp}<br>
						</div>
						</div>
						<div class="extra content">
							<!--span class="right floated">
								Right-someText
							</span-->
							<a href="${href}" target="_blank"><button class="fluid ui mini button">해당사이트이동</button></a>
							<!--span>
								<i class="user icon"></i>
								Left-someText
							</span-->
						</div>
					</div>
					`

				}

				r += `
				`

				fs.mkdirSync( resultDirPath, { recursive: true } );
				fs.writeFileSync( resultDirPath + window.siteNm + ".html", r, {flag : "w"} )
				console.log( "[E] - window.FNS.resultJsonToHtml" )
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
					//window.FNS.downloadJson(function(){
						console.log( "--------------- window.FNS.downloadHtml ---------------" );
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						window.FNS.getDetailLinksByJSON( function(){
							console.log( "--------------- window.FNS.getDetailLinks ---------------" );
							console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );
							window.FNS.resultJsonToHtml()
							console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );

							const remote = require('electron').remote
							let w = remote.getCurrentWindow()
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
})()

//https://www.zerocho.com/category/HTML&DOM/post/594bc4e9991b0e0018fff5ed
//xhr사용법
