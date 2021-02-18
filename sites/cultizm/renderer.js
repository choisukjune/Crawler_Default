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
				window.siteNm = "cultizm"
				window.siteUrl = "https://www.cultizm.com/"
				//window.pageBaseUrl = "https://www.cultizm.com/en/widgets/Listing/ajaxListing?mode=next&c=83&p="
				window.pageBaseUrls = [
					//"https://www.cultizm.com/en/widgets/Listing/ajaxListing?mode=next&c=83&p="
					  "https://www.cultizm.com/us/widgets/Listing/ajaxListing?mode=next&c=469&p="
					, "https://www.cultizm.com/us/widgets/Listing/ajaxListing?mode=next&c=468&p="
					, "https://www.cultizm.com/us/widgets/Listing/ajaxListing?mode=next&c=467&p="
				]
				window.pageBaseUrlsCnt = 0;
				window.downLoadHtmlCnt = 1;
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){
				url = "https://www.cultizm.com/en/widgets/Listing/ajaxListing?mode=next&c=83&p=1";
				webview.loadURL( url );
				//webview.executeJavaScript(`
				//var _el = window.document.getElementsByClassName("Toolbar__ProductCount-sc-14b11kg-3")[0].children[0].innerText
				//	Promise.resolve( _el )
				//`
				//).then(function(data){
					//window.maxPage = ( parseInt(( data * 1 ) / 120) ) + 1;
					window.maxPage = 50;
					console.log( "window.maxPage : " + window.maxPage );
					cbFunction();
				//})
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
				
				//webview.loadURL( url ).then(function(data){
				webview.executeJavaScript(`
				new Promise((resolve, reject) => {
					    var xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function() {
							if (xhr.readyState === xhr.DONE) {
								if (xhr.status === 200 || xhr.status === 201) {
									resolve(xhr.responseText);
								} else {
									console.error(xhr.responseText);
								}
							}
						};
						xhr.open('GET', '${url}');
						xhr.send();
				});
				`
				).then(function(data){

					if( data == "    \n    " && window.pageBaseUrlsCnt == window.pageBaseUrls.length - 1 )
					{
						debugger;
						cbFunction();
						return;	
					}
					
					if( data == "    \n    " )
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
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinksByHTML = function( cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				var targetDirPath = "./html/";
				var resultDirPath = "./result/";
				var list = global.fs.readdirSync( targetDirPath );
				

				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					var el = window.document.getElementsByClassName("product--info");
					var i = 0, iLen = el.length, io;
					for(;i<iLen;++i){
						io = el[ i ];
						
						var href = io.children[0].children[0].href
						var _id = href.split("/")
						var id = _id[ _id.length - 1 ];

						r[ id ] = {};
						r[ id ].websiteNm = window.siteNm;
						r[ id ].url = href;
						
						if( io.children[0].children[1].children[0].children[0].childElementCount )
						{
							try
							{
								//r[ id ].img = io.children[0].children[1].children[0].children[0].children[0].getAttribute("srcset");
								r[ id ].img = io.children[0].children[0].children[0].children[0].children[0].getAttribute("srcset").split(",")[0];
							}
							catch( er )
							{
								debugger;
							}
							
						}
						else
						{
							r[ id ].img = io.children[0].children[0].children[0].children[0].children[0].getAttribute("srcset").split(",")[0];							
						}

						r[ id ].nm = "";
						r[ id ].brand = ""
						r[ id ].salePrice = -1;
						r[ id ].msrp = -1;
						r[ id ].saleRatio = -1;
						r[ id ].isSoldOut = 0;
						r[ id ].info = [];

						r[ id ].currency = {
							mark : "$"
							, code : "USD"
						}

						r[ id ].nm = io.children[3].innerText;						
						r[ id ].brand = io.children[2].innerText;
						
						try
						{
							if( io.children[4].children[1].childElementCount == 1 )
							{
								r[ id ].salePrice = Number( io.children[4].children[1].children[0].innerText.replace( "$","" ).replace( /\,/gi,"" ) );
								r[ id ].msrp = Number( io.children[4].children[1].children[0].innerText.replace( "$","" ).replace( /\,/gi,"" ) );								
							}
							else
							{
								r[ id ].salePrice = Number( io.children[4].children[1].children[1].innerText.replace( "$","" ).replace( /\,/gi,"" ) );
								r[ id ].msrp = Number( io.children[4].children[1].children[0].innerText.replace( "$","" ).replace( /\,/gi,"" ) );	
							}
						}
						catch( er )
						{
							debugger;
						}
						


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
				window.FNS.getMaxPage( function(){
					console.log( "--------------- window.FNS.getMaxPage ---------------" );
					console.log( "--------------- window.FNS.downloadHtml ---------------" );
					window.FNS.downloadHtml(function(){
						console.log( "--------------- window.FNS.downloadHtml ---------------" );
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						window.FNS.getDetailLinksByHTML( function(){
							console.log( "--------------- window.FNS.getDetailLinks ---------------" );
							console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );
							//window.FNS.resultJsonToHtml()
							console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );

							const remote = require('electron').remote
							let w = remote.getCurrentWindow()
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
})()

//https://www.zerocho.com/category/HTML&DOM/post/594bc4e9991b0e0018fff5ed
//xhr사용법
