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
				window.siteNm = "jcrew"
				window.siteUrl = "https://www.jcrew.com/"
				//window.pageBaseUrl = "https://www.jcrew.com/data/v1/us/endeca-sale?Nrpp=120&Nb=men&Npge=1"
				window.pageBaseUrls = [
					  "https://www.jcrew.com/data/v1/us/endeca-shopall/men/clothing?Nrpp=120&Npge="
					, "https://www.jcrew.com/data/v1/us/endeca-shopall/men/accessories?Nrpp=120&Npge="
					, "https://www.jcrew.com/data/v1/us/enhance-category/mens_category/shoes_sneakers?Nrpp=120&Npge="
				]
				window.pageBaseUrlsCnt = 0;
				window.downLoadHtmlCnt = 1;
				window.downLoadJsonCnt = 1;
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( cbFunction ){
				url = "https://www.jcrew.com/r/sale/men?Nrpp=120&Npge=1";
				webview.loadURL( url );
				webview.executeJavaScript(`
				var _el = window.document.getElementsByClassName("category__pagination")[0].children[0].children[1].innerText
					Promise.resolve( _el.replace("of","").trim() )
				`
				).then(function(data){
					debugger;
					window.maxPage = data * 1;
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
				
				if( window.pageBaseUrls.length == window.pageBaseUrlsCnt )
				{
					debugger;
					cbFunction();
					return
				}

				console.log( "[S] - window.FNS.downloadJspn - " +  window.pageCnt );
				var dirPath = "./json/"
				var xhr_page = window.pageCnt;
				var xhr_url =  window.pageBaseUrls[ window.pageBaseUrlsCnt ] + xhr_page;
				console.log( xhr_url )
				webview.executeJavaScript(`
				new Promise((resolve, reject) => {
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function() { // 요청에 대한 콜백
					  if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
						if (xhr.status === 200 || xhr.status === 201) {
		   					resolve( xhr.responseText )
						} else {
						  console.error(xhr.responseText);
						}
					  }
					};
					xhr.open('GET', '${xhr_url}'); // 메소드와 주소 설정
					xhr.send(); // 요청 전송 
				});
				`
				).then(function(data){

					var _data = data;
					
					if( window.pageCnt == 1 )
					{
						var _o_data = JSON.parse( _data );
						window.maxPage = _o_data.pagination.totalPage;
						debugger;
					}

					fs.mkdirSync( dirPath, { recursive: true } );
					fs.writeFileSync( dirPath + window.downLoadJsonCnt + ".json", _data, {flag : "w"} )
					
					++window.downLoadJsonCnt;

					console.log( "[E] - window.FNS.downloadJspn - " +  window.pageCnt )
					
					if( window.maxPage == window.pageCnt )
					{
						window.pageCnt = 1;
						++window.pageBaseUrlsCnt;
						debugger;
						window.FNS.downloadJson( cbFunction );	
					}
					else
					{
						++window.pageCnt;
						debugger;
						window.FNS.downloadJson( cbFunction );	
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

				var idx = 0;

				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					var _to = JSON.parse( global.fs.readFileSync( targetDirPath + zo ).toString() );
					debugger;
					var k = 0,kLen = _to.productList.length,ko;
					for(;k<kLen;++k){
						ko = _to.productList[ k ];
						
						var dataArr = ko.products;
						var i = 0, iLen = dataArr.length, io;
						for(;i<iLen;++i){

							io = dataArr[ i ];

							var href = io.url;
							//var id = io.productCode + "_" + io.defaultColorCode;
							var id = io[ "extended-size-group-id" ];

							/*/
							r[ id ] = io;
							
							/*/
							r[ id ] = {};
							r[ id ].websiteNm = window.siteNm;
							r[ id ].url = window.siteUrl + io.url;
							
							//https://www.jcrew.com/s7-img-facade/AU451_WZ0788?fmt=jpeg&qlt=90,0&resMode=sharp&op_usm=.1,0,0,0&crop=0,0,0,0&wid=480&hei=480;
							//https://www.jcrew.com/s7-img-facade/AU451_WZ0788_m?fmt=jpeg&qlt=90,0&resMode=sharp&op_usm=.1,0,0,0&crop=0,0,0,0&wid=480&hei=480;
							
							var imgUrlBase = "https://www.jcrew.com/s7-img-facade/";
							var imgUrlParam = "?fmt=jpeg&qlt=90,0&resMode=sharp&op_usm=.1,0,0,0&crop=0,0,0,0&wid=480&hei=480";

							/*
							
							baseColorCode: "BL5795"
							baseProductCode: "J1785"
							프로퍼티가 존재하면 위프로퍼티로 이미지 URL을 생성한다.
							Tall 상품의 이미지를 별도로 생성하지 않고 기존이미지로 사용하기 위함인듯.

							*/
							if( io.showOnfigImage )
							{
								imgUrlParam = "_m" + imgUrlParam
							}

							
							var param00 = io.productCode;
							var param01 = io.tiles[0];

							
							if( io.baseProductCode && io.baseColorCode != null && io.extendedSize != "Regular" )
							{
								param00 = io.baseProductCode;
								//param01 = io.baseColorCode;
							}

							if( io.baseProductCode && io.baseColorCode == null && io.extendedSize != "Regular" )
							{
								param00 = io.baseProductCode;
								//param01 = io.tiles[0];
							}
							
							
							r[ id ].img = imgUrlBase + param00 + "_" + param01 + imgUrlParam ;	
							
							var color_nm = "";
							if( io.colors )
							{
								io.colors.forEach(function(item){
									if( item.colorCode == io.tiles[0] )
									{
										color_nm = item.colorName;
									}
								})
							}

							
							r[ id ].brand = io.brand;
							r[ id ].nm = io.productDescription + " - " + color_nm;
							
							if( !io.now )
							{
								r[ id ].salePrice = io.listPrice.amount;	
								r[ id ].msrp = io.listPrice.amount;
							}
							else
							{
								r[ id ].salePrice = io.now.amount;	
								r[ id ].msrp = io.listPrice.amount;
							}
							
							
							r[ id ].saleRatio = -1;
							r[ id ].isSoldOut = 0;
							r[ id ].info = [];
							r[ id ].currency = {
								mark : "$"
								, code : "USD"
							}
							r[ id ].info.push( io.brand );
							r[ id ].info.push( color_nm );
							
							if( r[ id ].msrp > -1 && r[ id ].salePrice > -1 )
							{
								var salePrice = r[ id ].salePrice;
								var msrp = r[ id ].msrp;
								r[ id ].saleRatio = (1 -( salePrice / msrp )).toFixed(2);
							}
							//*/
							console.log( idx );
							++idx
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
							//window.FNS.resultJsonToHtml()
							console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );

							//const remote = require('electron').remote
							//let w = remote.getCurrentWindow()
							//w.close()
							
						});
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
