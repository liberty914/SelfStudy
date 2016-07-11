var express = require('express');
var router = express.Router();  //라우팅에대한 정보를 리턴해줌, 우리는 여기에 라우팅을 덧붙일수 있다.
var path = require('path');
var MongoClient = require("mongodb").MongoClient  //몽고DB로 접속하려는 클라이언트객체
  , assert = require("assert")  //Java에서 사용하던 assert 테스트모듈과 동일한 라이브러리.
  , mongoURL = "mongodb://localhost:27017/mongoDBtest";  //몽고DB의 서버URL과 DB의 주소
var session = require("express-session");

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
var upload = multer({storage: storage});
// upload.single("inputName")
// upload.array("inputName", 12)
// upload.fields([{ name: "avatar", maxCount: 1 }, { name: "gallery", maxCount: 8 }])



router.use( session( {  //세션 생성
  //genid: function(req) { return genuuid(); },  //uid-safe 의존라이브러리를 이용해서 사용하는듯.
  secret: "secret_key",  //유저의 id로 세션을 관리
  key: "Rex",
  cookie: {maxAge: 1000*10*1},  //1분동안
  resave: true,  //false로 하면 request를 여러번해도 시간초과시 세션이 사라짐. true일경우, 리퀘스트마다 다시 시간이 초기화됨.
  saveUninitialized: true  //초기화되지않은 세션을 강제로 세션 저장소에 저장할 것인지.
}));



router.get("/", function(req, res) {
  console.log("몽고를 이용한 User 로그인 테스트 URL 접속");
  if (req.session.user_id) {
    res.redirect("/mongoDBlogin/getUser");
  }
  res.sendFile(path.join(__dirname+"/../public/mongoDBuser/login.html"));  //로그인페이지로 보냄
});


router.get("/createUser", function(req, res) {
  console.log("회원가입 페이지 출력");
  res.sendFile(path.join(__dirname+"/../public/mongoDBuser/createUser.html"));  //회원가입페이지로 보냄
});


router.post("/createUser", upload.array("images", 1), function(req, res) {
  console.log("회원가입 로직 시작");
  console.log(req.body);
  console.log(req.file);
  console.log(req.files);
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection('user').insert({
      id: req.body.id,
      pw: req.body.pw,
      email: req.body.email,
      like: req.body.like,
      profileImage: req.files.filename
    }, function(err, result) {
      console.log("결과물은?");
      console.log(result);
      db.close();
      //res.send(result);
    });
  });
  res.sendFile(path.join(__dirname+"/../public/mongoDBuser/login.html"));  //로그인페이지로 보냄
});


router.post("/loginMongo", function(req, res) {
  console.log("로그인 유효성체크");
  console.log(req.session);
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection('user').findOne(  //1개만 찾음
      {id: req.body.id},  //where 조건
      {id: 1, pw: 1},  //select 할 컬럼
      function(err, document) {
        console.log("결과물은?");
        console.log(document);  //object가 들어옴
        result = 0;  //id부터 틀린상태 (find()의 결과물이 없는경우)
        if (document && document.id === req.body.id) {
          result = 1;  //id는 존재하지만, 비밀번호는 틀린상태
          if (document.pw === req.body.pw) {
            result = 2;  //id와 pw가 정확히 맞은 상태 (로그인가능)
            req.session.user_id = document.id;  //세션 부여
            console.log("현재 로그인된 세션 ==> "+req.session.user_id);
          }
        }
        console.log("결과값은 ==> "+result);
        db.close();
        //res.status(result);
        //res.redirect("/mongoDBlogin/getUser");
        res.send(new Array(result, document));  //배열의 [0]은 상태값, [1]은 find()된 object
      }
    );
  });
});


router.get("/getUser", function(req, res) {
  console.log("내 정보 보기 페이지 보내기");
  if (!req.session.user_id) {  //세션이 존재하지 않으면
    res.redirect("/mongoDBlogin");  //로그인페이지로 보냄
  }
  res.sendFile(path.join(__dirname+"/../public/mongoDBuser/read&updateUser.html"));
});


router.get("/getUser/getCurrentUser", function(req, res) {
  console.log("로그인한 유저의 내 정보 보기");
  console.log(req.session);
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection('user').findOne(  //1개만 찾음
      { id: req.session.user_id },  //where 조건
      function(err, document) {
        db.close();
        res.send(document);
      }
    );
  });
});


router.get('/sessionReset', function(req, res) {  //세션시간을 체크하는 request
  res.send(req.session.cookie.maxAge / 1000+"");  //문자열로 보내주어야 Ajax에서 responseText로 받을수 있다.
});


router.get('/sessionCheck', function(req, res) {  //세션시간을 체크하는 request
  res.send(req.session.cookie.maxAge / 1000+"");  //문자열로 보내주어야 Ajax에서 responseText로 받을수 있다.
});


router.get("/getUser/logout", function(req, res) {
  console.log("로그아웃을 진행합니다.");
  console.log(req.session);
  delete req.session.user_id;
  res.redirect("/mongoDBlogin/getUser");
});


router.post("/getUser/update", function(req, res) {
  console.log("유저정보 업데이트를 진행합니다.");
  console.log(req.session);
  console.log(req.body);
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection("user").updateOne(
      { id: req.session.user_id },  //where조건
      { $set: {
        pw: req.body.pw,
        email: req.body.email,
        like: req.body.like
      }},
      function(err, data) {
        var result = data.result.ok;
        console.log("결과는? ==> " + result);
        db.close();
        res.redirect("/mongoDBlogin/getUser");
        //res.sendStatus(result);
      }
    );
  });
});


router.get("/getUser/deleteUser", function(req, res) {
  console.log("유저의 회원탈퇴를 진행합니다.");
  console.log(req.session);
  console.log(req.body);
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection("user").deleteOne(
      { id: req.session.user_id },  //where조건
      function(err, data) {
        var result = data.result.ok;
        delete req.session.user_id;
        console.log("결과는? ==> " + result);
        db.close();
        res.redirect("/mongoDBlogin/getUser");
        //res.sendStatus(result);
      }
    );
  });
});



module.exports = router;