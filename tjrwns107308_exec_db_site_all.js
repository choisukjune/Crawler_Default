//-------------------------------------------------------;
// REQUIRE;
//-------------------------------------------------------;

var fs = require( "fs" );
var cp = require( "child_process" );

//-------------------------------------------------------;
// VARIABLE;
//-------------------------------------------------------;

global.CONST = {};
global.CONST.MongoDB = {};
global.CONST.MongoDB.OPTIONS = {
	"self" : { ID : "admin", PWD : "tjrwns2482", HOST : "ec2-52-78-47-3.ap-northeast-2.compute.amazonaws.com", PORT : 59320 }	
};


var ROOT_PATH = process.cwd();

var CP_COMMAND = {};
	CP_COMMAND.MONGO = "..\\Binary\\mongodb\\mongodb-win32-x86_64-windows-4.4.3\\bin\\mongo";

var DBJS_DIRECTORY_PATH = ROOT_PATH + "\\query\\dbjs\\";

//-------------------------------------------------------;
// FUNCTION;
//-------------------------------------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;

/*
 * @function
 * @param {String} dbjsNm
 * @param {boolean} bResult
 * @return {String} r
 */
var exec_query_DB = function( dbjsNm, bResult ){
	
	var DBJS_NM = dbjsNm;
	var FILE_PATH = DBJS_DIRECTORY_PATH + DBJS_NM;

	var _t_command = CP_COMMAND.MONGO + " --username <!=ID=!> --password <!=PWD=!> --authenticationDatabase admin --host <!=HOST=!> --port <!=PORT=!> admin <!=FILE_PATH=!>";
	if( bResult ) _t_command = _t_command + " > " + dbjsNm + "__" + Date.now() + ".result";
	
	var command = _t_command.replace( "<!=ID=!>", global.CONST.MongoDB.OPTIONS.self.ID )
		.replace( "<!=PWD=!>", global.CONST.MongoDB.OPTIONS.self.PWD )
		.replace( "<!=HOST=!>", global.CONST.MongoDB.OPTIONS.self.HOST )
		.replace( "<!=PORT=!>", global.CONST.MongoDB.OPTIONS.self.PORT )
		.replace( "<!=FILE_PATH=!>", FILE_PATH );

	var r = cp.execSync( command ).toString();
		r = deleteLines( r , 4 )
	return r;
};

//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
/*
 * @function
 * @param {String} str
 * @param {Number} n
 * @return {String} str
 */
var deleteLines = function( str, n ){
	var i = 0,iLen = n,io;
	for(;i<iLen;++i){ str = str.slice(str.indexOf("\n") + 1, str.length ); }
	//str = str.replace( /\t/g, '' );
	//str = str.replace( /\r\n/g, '' );
	return str;
};
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
var makeDbJsInsert = function( nm ){
    console.log( nm )
    var FILE_PATH = process.cwd() + "/sites/" + nm + "/result/" + nm + ".json";
    var TDBJS_PATH = process.cwd() + "/query/tdbjs/insert.tdbjs";
    var DBJS_PATH = process.cwd() + "/query/dbjs/";
    var _q = fs.readFileSync( TDBJS_PATH ).toString();
    var _d = fs.readFileSync( FILE_PATH ).toString();
    var q = _q.replace( "<!=BRAND_NM=!>", nm )
            .replace( "<!=DATA=!>", _d );
    var dbjsNm = "insert_" + nm + ".dbjs"
    console.log( dbjsNm )
    console.log( DBJS_PATH + dbjsNm )
    fs.writeFileSync( DBJS_PATH + dbjsNm, q, {flag:"w"} );
    
    exec_query_DB( dbjsNm, 0 );

    return;
}
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
var makeBrandList = function(){
    var r = [];
    var arr = fs.readdirSync( process.cwd() + "/sites/" );
    var i = 0,iLen =  arr.length,io;
    for(;i<iLen;++i){
        io = arr[ i ]
        if( io != "query" ) r.push( io )
    }
    return r;
}

//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
//-------------------------;
var FN00 = function(){
    exec_query_DB( "insertSiteAll.dbjs", 0 );
}

FN00();