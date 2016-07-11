try {

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require("mongodb").MongoClient  //몽고DB로 접속하려는 클라이언트객체
  , assert = require("assert")  //Java에서 사용하던 assert 테스트모듈과 동일한 라이브러리.
  , mongoURL = "mongodb://localhost:27017/mongoDBtest";  //몽고DB의 서버URL과 DB의 주소
var session = require("express-session");
  //npm install express-session // + base64-url + crc + uid-safe 총 4개의 의존모듈이 설치되는데,
  //추가로 npm install debug 라는 의존모듈을 설치해줘야 에러가 나지않음.
var Waterline = require("waterline");  //워터라인 모듈

// 파일업로드 관련
var date = new Date(),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate(),
    h = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds(),
    ms = date.getMilliseconds(),
    current = ""+Y+M+D+h+m+s+ms;
var multer = require("multer");  //파일업로드를 지원하는 multer 모듈
var storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "./uploads/"); },  //이 위치에 업로드
  filename   : function (req, file, cb) {
    var fName = file.originalname;
    var strArr = fName.split(".");
    fName = fName.substring(0, fName.lastIndexOf(".")) + new Date().getMilliseconds() + "." + strArr[strArr.length-1];
    cb(null, fName);  //원래파일이름 + 밀리세컨 + . + 확장자 형식으로 저장
  }
});
//var upload = multer({dest: "uploads/" });
var upload = multer({storage: storage});  //나의 결론... 파일업로드는 app.js(express().get()) 에서만 가능하다. express.Router().get() 에서는 안된다.
// upload.single("inputName")
// upload.array("inputName", 12)
// upload.fields([{ name: "avatar", maxCount: 1 }, { name: "gallery", maxCount: 8 }])


//var routes = require('./routes/index');  //확장자는 쓰지 않는듯 하다
//var users = require('./routes/users');


var app = express();  //실제적으로 express를 구동하게하는 Core js파일

// 채팅 관련
//var http = require("http").Server(app);
//var io = require("socket.io")(http);  //이렇게만하면 port가 충돌난다.
app.io = require("socket.io")();  //그래서 port를 하나만 올려도 되도록, 전역에서 사용하는 app에다가 담는다.


// view engine setup
app.set('views', path.join(__dirname, 'views'));  //__dirname 은 노드가 실행된 현재디렉토리
app.set('view engine', 'jade');
app.set("srict routing", true);  //엄격한 라우팅을 활성화함 ("/foo" 와 "/foo/" 는 동일한 라우팅)
app.set("case sensitive routing", false);  //대소문자를 구분해서 라우팅을 할지 정함. ("/foo" 와 "/Foo" 는 동일한 라우팅)
//app.set(name, value) 메소드는 앱에대한 설정을 진행한다.


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));  //개발자가 분석하기 쉽도록, Request접속로그를 찍어주는 미들웨어인듯.
app.use(bodyParser.json());  //JSON 구문분석 미들웨어, 들어오는 http request body가 json 일때도 파싱할 수 있도록 지원한다. (req.body.id)
app.use(bodyParser.urlencoded({ extended: false }));  //URLencoded 를 지원
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));  //index.html이 로딩될 HOME 디렉토리를 설정함
// app.use("/mongoDB", require("./routes/mongodbTest"));
// app.use("/mongoDBlogin", require("./routes/mongodbLogin"));
// app.use("/waterlineLogin", require("./routes/waterlineLogin"));
// app.use("/mobileWaterlineMongo", require("./routes/mobileWaterlineMongo"));
// app.use("/kakaotalk", require("./routes/kakaotalk"));

//app.use('/', routes);  //index.html 파일이 없을 경우에 실행함
//app.use('/users', users);
//app.use() 메소드는 각종 미들웨어를 넣는 곳이다. Request가 일어날 때, 중간단계에 처리할 것을 삽입하는듯 하다.



app.use( session( {  //세션 생성
  //genid: function(req) { return genuuid(); },  //uid-safe 의존라이브러리를 이용해서 사용하는듯.
  secret: "secret_key",  //유저의 id로 세션을 관리
  key: "Rex",
  cookie: {maxAge: 1000*60*1},  //1분동안
  resave: true,  //false로 하면 request를 여러번해도 시간초과시 세션이 사라짐. true일경우, 리퀘스트마다 다시 시간이 초기화됨.
  saveUninitialized: true  //초기화되지않은 세션을 강제로 세션 저장소에 저장할 것인지.
}));



// MongoClient.connect(mongoURL, function(err, db) {  //몽고디비 연결테스트?
//   if (err) { console.log("에러 내용 ==> " + err); }
//   assert.equal(null, err);  //assert 테스트모듈로 에러를 검사
//   console.log("몽고디비가 정상 작동하는지 검사합니다.");
//   db.close();
//   console.log("검사를 완료하였습니다.");
// });



//=================================================================================================================================================



// var requireAuthentication = function() { console.log("aaa"); };
// var loadUser = function() { console.log("bbb"); };
// app.all("/*", requireAuthentication, loadUser);  //모든 웹페이지의 전처리를 담당
// app.all("/aaa/*", requireAuthentication);  //근데 얘들 주석을 풀면 페이지로딩이 index.html 외에는 안됨



//get방식 "/test" 요청 처리
app.get("/test", function(req, res) {
  res.sendFile(path.join(__dirname+"/public/test.html"));
});

app.get("/testGET", function(req, res) {
  console.log("\n ===== 테스트 get URL 접속 ===== \n");
  console.log();
  res.send('{"object":"aaa","bbb":"bbb","ccc": 12}');
});
app.post("/testPOST", upload.array("images", 12), function(req, res) {
  console.log("\n ===== 테스트 post URL 접속 ===== \n");
  console.log(req.files);
  console.log(req.body);
  res.send(req.files);
});
app.post("/testFORM", upload.array("images", 12), function(req, res) {
  console.log("\n ===== 테스트 post FORM URL 접속 ===== \n");
  console.log(req.file);  //upload.single("images")  //여러개의 파일을 보내면 에러가난다.
  console.log(req.files);  //upload.array("images", 12)  Array로 들어옴. 무조건 이걸로 통일시키는게 좋음.
  console.log(req.body);
  res.send(req.files);
});



app.post("/coupang", function(req, res) {
  console.log("CSS만으로 만들어진 쿠팡 웹페이지 로딩");
  res.sendFile(path.join(__dirname+"/public/coupang/coupang_only_CSS.html"));
});



app.get("/coupang", function(req, res) {
  console.log("CSS만으로 만들어진 쿠팡 웹페이지 로딩");
  res.sendFile(path.join(__dirname+"/public/coupang/coupang_only_CSS.html"));
});



app.get("/applicat", function(req, res) {
  console.log("어플리캣 웹(PC버전) 로딩");
  res.sendFile(path.join(__dirname+"/public/applicat/applicat.html"));
});



//=================================================================================================================



app.get("/kakaotalk", function(req, res) {
  res.sendFile(path.join(__dirname+"/public/kakaotalk/main.html"));
});


var num = 0;
app.io.on("connection", function(socket) {
  //받는 함수 ==> socket.on("이벤트명", 콜백함수)
  //보내는 함수 ==> io.emit("이벤트명", 보낼데이터)  * emit: (빛.열.소리 등을)내다, 발하다, (신호.영상을)발신하다, 송신하다

  app.io.emit('news', { hello: 'world' });
  console.log("유저가 연결되었습니다. 현재 접속자 : "+ (++num) +"명");
  socket.on("disconnect", function (data) {
    console.log("유저의 연결이 끊어졌습니다. 현재 접속자 : "+ (--num) +"명")
    app.io.emit("out", socket.talkName);
  });

  socket.on("newFace join", function(talkName) {
    console.log("대화명 ==> " + talkName);
    socket.talkName = talkName;
    app.io.emit("newFace join", talkName);
  });

  socket.on("chat message", function(msg) {  //받을 때
    console.log("chat message: "+msg);
    //socket.broadcast.emit("broadcast");  //특정 소켓을 제외하고 모든 사람에게 메세지를 보낼 경우
    app.io.emit("chat message", {talkName: socket.talkName, msg: msg});  //보낼 때, 보낸사람을 포함한 모든 사람에게 메세지를 보낼 경우
    //socket.emit("chat message", {talkName: socket.talkName, msg: msg});
  });

});



//=================================================================================================================


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;



} catch (e) {
  console.log(e);
}