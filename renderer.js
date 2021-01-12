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

		window.FNS = {};

		window.FNS.logics = {
			init : 0
			, downloadHtml : 0
			, getDetailLinks : 0
			, downloadDetailHtml : 0
			, detailHtmlToObject : 0
			, resultJsonToHtml : 0
		}

		window.pageBaseUrl = "https://eomisae.co.kr/index.php?mid=os&page="
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
			}
			
			//-------------------------------------------------------;
			//페이지MAX걊 구하기;
			//-------------------------------------------------------;
			window.FNS.getMaxPage = function( url ){
				url = url || webview.getURL();
				webview.loadURL( url );
				webview.executeJavaScript(`
					var _el = window.document.getElementsByClassName("frst_last")[1].href
					Promise.resolve( _el )
				`
				).then(function(data){
					window.maxPage = window.UTIL.URL.paramToObject( data ).page * 1;
					console.log( "window.maxPage : " + window.maxPage );
				})
			}
			//-------------------------------------------------------;
			//게시물HTML저장하기;
			//-------------------------------------------------------;
			window.FNS.downloadHtml = function( url, targetDate, cbFunction ){
				
				console.log( "[S] - window.FNS.downloadHtml - " +  window.pageCnt );
				targetDate = targetDate || window.UTIL.DateFormat.YYYYMMDD();
				var dirPath = "./list/html/" + targetDate + "/"
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

					if( Number( date.replace(/\./gi,"") ) < Number( targetDate.substr(2,6) ) )
					{
						window.document.getElementById("_tmp").innerHTML = "";
						console.log( "[E] - window.FNS.downloadHtml - 큼" +  window.pageCnt );
						cbFunction( targetDate );
					}
					else if( Number( date.replace(/\./gi,"") ) > Number(  targetDate.substr(2,6) ) )
					{
						console.log( "[E] - window.FNS.downloadHtml - 작음" +  window.pageCnt )
						
						++window.pageCnt;
						
						window.FNS.downloadHtml( window.pageBaseUrl + window.pageCnt, targetDate, cbFunction );
						window.document.getElementById("_tmp").innerHTML = "";
					}
					else
					{
						fs.mkdirSync( dirPath, { recursive: true } );
						fs.writeFileSync( dirPath + window.pageCnt + ".html", _data, {flag : "w"} )
						console.log( "[E] - window.FNS.downloadHtml - " +  window.pageCnt )
						
						++window.pageCnt;
						
						window.FNS.downloadHtml( window.pageBaseUrl + window.pageCnt, targetDate, cbFunction );
						window.document.getElementById("_tmp").innerHTML = "";
					}

				})
			}


			//-------------------------------------------------------;
			//게시물상세페이지링크 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.getDetailLinks = function( targetDate, cbFunction ){
				
				console.log( "[S] - window.FNS.getDetailLinks" )

				targetDate = targetDate || window.UTIL.DateFormat.YYYYMMDD();
				var targetDirPath = targetDirPath || "./list/html/" + targetDate + "/";
				var resultDirPath = resultDirPath || "./list/json/" + targetDate + "/";
				var list = global.fs.readdirSync( targetDirPath );

				var r = {};
				var z = 0,zLen=list.length,zo;
				for(;z<zLen;++z)
				{
					zo = list[ z ];
					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					var el = window.document.getElementsByClassName("card_content");

					var i = 0, iLen = el.length, io;
					for(;i<iLen;++i){
						io = el[ i ];
						var date = io.children[0].children[1].innerText;
						var href = io.children[1].children[0].href

						if( Number( date.replace(/\./gi,"") ) < Number( targetDate.substr(2,6) ) ) break;
						if( Number( date.replace(/\./gi,"") ) > Number( targetDate.substr(2,6) ) ) continue;

						console.log( date + " - " + href );

						//console.log( io.parentElement.children[0].children[0].src )
						if( io.parentElement.children[0].children[0].src ==  "http://eomisae.co.kr/images/123.png" )
						{
							console.log( date + " - 아직열리지않음 - " + href );
							continue;
						}

						r[ window.UTIL.URL.paramToObject( href ).document_srl ] = {
							url : href
							, img : io.parentElement.children[0].children[0].src
						};
					}
				}

				
				try
				{
					fs.mkdirSync( resultDirPath, { recursive: true } );
					fs.writeFileSync( resultDirPath + targetDate + ".json", JSON.stringify( r ,null,4 ), {flag:"w"} );
					window.document.getElementById("_tmp").innerHTML = "";
					console.log( "[E] - window.FNS.getDetailLinks" )
					cbFunction( targetDate );
				}
				catch(er)
				{
					console.log( er );
				}
			}
			//-------------------------------------------------------;
			//게시물상세페이지HTML 추출 및 저장하기;
			//-------------------------------------------------------;
			window.FNS.downloadDetailHtml = function( targetDate, cbFunction ){
				console.log( "[S] - window.FNS.downloadDetailHtml - " + window._tmp.cnt )
				targetDate = targetDate || window.UTIL.DateFormat.YYYYMMDD();
				console.log( targetDate )
				var targetFilePath = targetFilePath || "./list/json/" + targetDate + "/" + targetDate + ".json";
				var resultDirPath = resultDirPath || "./detail/html/" + targetDate + "/";

				if( window.linkList.length == 0 )
				{
					window.linkList = JSON.parse( global.fs.readFileSync( targetFilePath ).toString() );
					window.linkListKeys = Object.keys( window.linkList );
					fs.mkdirSync( resultDirPath, { recursive: true } );
					var _ta = global.fs.readdirSync( resultDirPath );
					var i = 0,iLen = _ta.length,io;
					for(;i<iLen;++i){
						io = _ta[ i ].split(".")[0];
						window.resultFileList[ io ] = {}
					}
					window._tmp.cnt = 0
				}

				if( window.linkListKeys.length == window._tmp.cnt )
				{
					console.log( "[E] - window.FNS.downloadDetailHtml - " + window._tmp.cnt )
					cbFunction( targetDate );
					return;
				}
				var _t = window.linkList[ window.linkListKeys[ window._tmp.cnt ] ]

				/*/
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() { // 요청에 대한 콜백
				  if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
				    if (xhr.status === 200 || xhr.status === 201) {

							var data = xhr.responseText;
					   		var _data = data.replace(/\/\/img/gi, "https://img");

							fs.mkdirSync( resultDirPath, { recursive: true } );
  					 		fs.writeFileSync( resultDirPath + window.linkListKeys[ window._tmp.cnt ] + ".html", _data, {flag : "w"} )

							console.log( "파일생성완료!" )

  							++window._tmp.cnt;

  							setTimeout(function(){ window.FNS.downloadDetailHtml(); },1000)



				    } else {
				      console.error(xhr.responseText);
				    }
				  }
				};
				xhr.open('GET', _t.url ); // 메소드와 주소 설정
				xhr.send(); // 요청 전송
				// xhr.abort(); // 전송된 요청 취소

				/*/
				if( !window.resultFileList[  window.linkListKeys[ window._tmp.cnt ] ] ){
					debugger;
					webview.loadURL( _t.url );
					webview.executeJavaScript(`
						var _el = window.document.getElementsByClassName("_wrapper")[0].innerHTML
					 	Promise.resolve( _el )
					 `).then(function(data){

				 		var _data = data.replace(/\/\/img/gi, "https://img");
				 		fs.mkdirSync( resultDirPath, { recursive: true } );
				 		fs.writeFileSync( resultDirPath + window.linkListKeys[ window._tmp.cnt ] + ".html", _data, {flag : "w"} )
						console.log( window._tmp.cnt + " / " + window.linkListKeys.length + " - " + _t.url + " - 파일생성완료!" )
						console.log( "[E] - window.FNS.downloadDetailHtml - " + window._tmp.cnt )
						++window._tmp.cnt;
						setTimeout(function(){ window.FNS.downloadDetailHtml( targetDate, cbFunction ); },1000)
					})
			 	}
				else
				{
					console.log( window._tmp.cnt + " / " + window.linkListKeys.length + " - " + _t.url + " - 파일이존재함" )
					console.log( "[E] - window.FNS.downloadDetailHtml - " + window._tmp.cnt )
					++window._tmp.cnt;
					setTimeout(function(){ window.FNS.downloadDetailHtml( targetDate, cbFunction ); },1000)
				}
				 //*/
			}
			//-------------------------------------------------------;
			//상세페이지 HTML 데이터추출 및 파일 저장;
			//-------------------------------------------------------;
			window.FNS.detailHtmlToObject = function( targetDate, cbFunction ){
				console.log( "[S] - window.FNS.detailHtmlToObject" )
				
				targetDate = targetDate || window.UTIL.DateFormat.YYYYMMDD();
				var targetDirPath = targetDirPath || "./detail/html/" + targetDate + "/";
				var resultDirPath = resultDirPath || "./detail/json/" + targetDate + "/";
				var listObj = JSON.parse( global.fs.readFileSync( "./list/json/" + targetDate + "/" + targetDate + ".json" ).toString() );

				if( window.detailList.length == 0 )
				{
					window.detailList = global.fs.readdirSync( targetDirPath );
					window._tmp.cnt = 0
				}
				var a = []
				var z = 0,zLen = window.detailList.length,zo;
				for(;z<zLen;++z){
					zo = window.detailList[ z ];

					window.document.getElementById("_tmp").innerHTML = "";
					window.document.getElementById("_tmp").innerHTML = global.fs.readFileSync( targetDirPath + zo ).toString();

					var el00 = window.document.getElementsByTagName("table")[0].children[1].children;
					var el_title = window.document.getElementsByTagName("h2")[0].innerText;
					var id = zo.split(".")[0];
					if( !listObj[ id ])
					{
						console.log( id )
						//TODO
						//예외처리 추가해야함;
					}
					else
					{
						var r = {
							id : id
							, source : "eomisae"
							, info : {}
							, detail : []
							, thmbnail : listObj[ zo.split(".")[0] ].img
							, title : el_title
							, date : targetDate
						};

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
							r.detail.push( io.outerHTML );
						}

						a.push( r );
						window.document.getElementById("_tmp").innerHTML = "";
					}
				}

				try
				{
					fs.mkdirSync( resultDirPath, { recursive: true } );
					var _txt = fs.readFileSync( resultDirPath + targetDate + ".json" ).toString();
					var _to = JSON.parse( _txt );
					
					fs.writeFileSync( resultDirPath + targetDate + ".json", JSON.stringify( a ,null,4 ), {flag:"w"} );
					console.log( "[E] - window.FNS.detailHtmlToObject" )
					window.detailList = [];
					window._tmp.cnt = 0
					if( cbFunction ) cbFunction( targetDate );
				}
				catch(er)
				{
					console.log( er );
				}

			};

			//-------------------------------------------------------;
			//게시물상세페이지HTML 추출 및 저장하기;
			//-------------------------------------------------------;
			/*
			    {
					"id": "53959378",
					"info": {
						"링크": "https://www.newbalance.com/pd/mens-made-in-us-993/MR993V1-10103-M.html",
						"할인 코드": "https://www.newbalance.com/account-login?src=DBMAC10FS&ECID=db_nbus_Abandon_Cart_Touch1&RMID=db_nbus_Abandon_Cart_Touch1&RIID=108,347,785&utm_source=email&UTM_campaign=db_nbus_Abandon_Cart_Touch1",
						"면세 범위": "미국은200딸라",
						"배송 정보": "미국내배송 무료"
					},
					"detail": [
						"<p><img alt=\"zxczxc.PNG\" src=\"https://img.eomisae.co.kr/files/attach/images/138/378/959/053/acfa49d393f7ffc2497a07c25bd19aad.PNG\" rel=\"xe_gallery\"></p>",
						"<p>&nbsp;</p>",
						"<p>9.5 사이즈부터 다시 재입고됐어요 ~ 10%할인 경유해서 구매하세요&nbsp;&nbsp;</p>",
						"<p>&nbsp;</p>"
					]
				},
			*/
			window.FNS.resultJsonToHtml = function( targetDate ){
				console.log( "[S] - window.FNS.resultJsonToHtml" )
					targetDate = targetDate || window.UTIL.DateFormat.YYYYMMDD();
				var targetFilePath = targetFilePath || "./detail/json/" + targetDate + "/" + targetDate + ".json";
				var resultDirPath = resultDirPath || "../HttpServer_Default/html/";

				var _ta = JSON.parse( global.fs.readFileSync( targetFilePath ).toString() ).reverse();

				var r = `
				`;
				var i = 0,iLen =_ta.length,io;
				for(;i<iLen;++i){
					io = _ta[ i ];
					console.log( io.id );
					var thmbnail = io.thmbnail;
					var description = ""
					var title = io.title;
					var date = io.date;
					var href = "#";
					var s,so;
					for( s in io.info ){
						so = io.info[ s ];
						if( s == "링크" ) href = so;
						else
						{
							description += s + " : " + so + "<br>"
						}
					}
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
							<a>${date}</a>
						</div>

						<div class="description" style="font-size:11px;word-break: break-all;">
							
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
				fs.writeFileSync( resultDirPath + targetDate + ".html", r, {flag : "w"} )
				console.log( "[E] - window.FNS.resultJsonToHtml" )
			}
			//-------------------------------------------------------;
			//전체로직실행;
			//-------------------------------------------------------;
			window.FNS.FN00 = function( targetDate ){
				
				console.log( "[ S ] - window.FNS.logics" )
				
				window.FNS.init()
				console.log( "--------------- window.FNS.downloadHtml ---------------" );
				window.FNS.downloadHtml( null ,targetDate, function(){
					console.log( "--------------- window.FNS.downloadHtml ---------------" );
					console.log( "--------------- window.FNS.getDetailLinks ---------------" );
					window.FNS.getDetailLinks(targetDate, function(){
						console.log( "--------------- window.FNS.getDetailLinks ---------------" );
						console.log( "--------------- window.FNS.downloadDetailHtml ---------------" );
						window.FNS.downloadDetailHtml( targetDate, function(){
							console.log( "--------------- window.FNS.downloadDetailHtml ---------------" );
							console.log( "--------------- window.FNS.detailHtmlToObject ---------------" );
							window.FNS.detailHtmlToObject( targetDate, function(){
								console.log( "--------------- window.FNS.detailHtmlToObject ---------------" );
								console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );
								window.FNS.resultJsonToHtml( targetDate )
								console.log( "--------------- window.FNS.resultJsonToHtml ---------------" );
							});
						})
					});
				} )

			
			}
		})
	}
})()

//https://www.zerocho.com/category/HTML&DOM/post/594bc4e9991b0e0018fff5ed
//xhr사용법
