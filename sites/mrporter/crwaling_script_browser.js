var reqDataToLocalCrawlingServer = function( siteNm, type, p, data ){

    var xhr = new XMLHttpRequest();
    var data = {
        siteNm : siteNm
        , type : type
        , data : data
        , p : p
    };
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
        //console.log(JSON.parse(  ));
        //debugger;
        console.log( window.reqUrls[ window.tmp_cnt ] + window.reqPage +  " / " + window.htmlCnt )
        ++window.reqPage;
        ++window.htmlCnt;
        getData();
        } else {
        console.error(xhr.responseText);
        }
    };
    xhr.open('POST', 'http://localhost:8889/writeHtml');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify( data )); // 데이터를 stringify해서 보냄
    
    
    
    

}
window.reqUrls = [
    "https://www.mrporter.com/en-kr/mens/clothing/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/shoes/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/accessories/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/luxury-watches/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/lifestyle/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/grooming/?pageNumber="
    , "https://www.mrporter.com/en-kr/mens/sport/?pageNumber="
]
window.maxPage = window.document.getElementsByClassName("Pagination7__counter")[0].innerText.split(" of " )[1] * 1
window.reqPage = 1;
window.tmp_cnt = 0;
window.htmlCnt = 1;
var getData = function(){
    if( window.reqUrls.length - 1 == window.tmp_cnt  )
    {
        console.log( "all - complete!")
        return
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.status === 200 || xhr.status === 201)
        {
            //var o = JSON.parse( xhr.responseText )
            //console.log( xhr.responseText );
            // if( window.reqPage == 1)
            // {
            //     var a = JSON.parse( xhr.responseText.match( /<script>window.state[\s\S]*?>[\s\S]*?<\/script>/gi)[0].split("\n")[0].replace("<script>window.state=","").replace("</script>","") )
            //     console.log( a.plp.listing.response.body.totalPages )
            //     window.maxPage = a.plp.listing.response.body.totalPages;
            // }
            reqDataToLocalCrawlingServer( "mrporter", "html", window.htmlCnt, xhr.responseText );
            
        } 
        else
        {
            console.error(xhr.responseText);
        }
    };

    if( window.maxPage < window.reqPage )
    {
        debugger;
        window.reqPage = 1
        ++window.tmp_cnt;
        getMaxPage(function(){
            getData()
        });
    }
    else
    {
        //xhr.open('GET', 'https://www.mrporter.com/api/inseason/search/resources/store/mrp_kr/productview/byCategory?attrs=true&category=%2Fshoes&locale=en_GB&pageNumber=' + 1 + '&pageSize=60');
        xhr.open('GET', window.reqUrls[ window.tmp_cnt ] + window.reqPage)
        xhr.send();
    }
    
}

var getMaxPage = function( cbFunction ){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.status === 200 || xhr.status === 201)
        {
            var a = JSON.parse( xhr.responseText.match( /<script>window.state[\s\S]*?>[\s\S]*?<\/script>/gi)[0].split("\n")[0].replace("<script>window.state=","").replace("</script>","") )
            console.log( a.plp.listing.response.body.totalPages )
            window.maxPage = a.plp.listing.response.body.totalPages;
            cbFunction();
        } 
        else
        {
            console.error(xhr.responseText);
        }
    };


    //xhr.open('GET', 'https://www.mrporter.com/api/inseason/search/resources/store/mrp_kr/productview/byCategory?attrs=true&category=%2Fshoes&locale=en_GB&pageNumber=' + 1 + '&pageSize=60');
    xhr.open('GET', window.reqUrls[ window.tmp_cnt ] + window.reqPage)
    xhr.send();
}

getMaxPage(function(){
    getData()
});
