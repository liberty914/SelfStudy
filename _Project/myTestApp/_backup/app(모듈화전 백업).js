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
var Waterline = require('waterline');  //워터라인 모듈

//var routes = require('./routes/index');  //확장자는 쓰지 않는듯 하다
//var users = require('./routes/users');


var app = express();


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
//app.use('/', routes);  //index.html 파일이 없을 경우에 실행함
//app.use('/users', users);
//app.use(express.multipart());  //파일업로드의 경우, express 4버전부터는 안됨. multer 와 같은 모듈의 추가설치를 권장하고있음.
//app.use() 메소드는 각종 미들웨어를 넣는 곳이다. Request가 일어날 때, 중간단계에 처리할 것을 삽입하는듯 하다.



app.use( session( {  //세션 생성
  //genid: function(req) { return genuuid(); },  //uid-safe 의존라이브러리를 이용해서 사용하는듯.
  secret: "secret_key",  //유저의 id로 세션을 관리
  key: "Rex",
  cookie: {maxAge: 1000*10*1},  //1분동안
  resave: true,  //false로 하면 request를 여러번해도 시간초과시 세션이 사라짐. true일경우, 리퀘스트마다 다시 시간이 초기화됨.
  saveUninitialized: true  //초기화되지않은 세션을 강제로 세션 저장소에 저장할 것인지.
}));


MongoClient.connect(mongoURL, function(err, db) {  //몽고디비 연결테스트?
  if (err) { console.log("에러 내용 ==> " + err); }
  assert.equal(null, err);  //assert 테스트모듈로 에러를 검사
  console.log("몽고디비가 정상 작동하는지 검사합니다.");
  db.close();
  console.log("검사를 완료하였습니다.");
});


//워터라인 Collection 정의하기, 이를 model 이라고 하는듯 하다.
var userCollection = Waterline.Collection.extend({
  connection: "default",
  identity: "usertable",  //대문자를 써도 소문자로만 인식함. waterline.initialize()메소드에서 ontology.collections.usertable 로 사용
  tableName: 'user',   // Define a custom table name (테이블명 정의)
  schema: true,        // Set schema true/false for adapters that support schemaless
  adapter: 'mongodb',  // Define an adapter to use (사용할 데이터베이스 정의)
  attributes: {        // Define attributes for this collection (컬럼을 정의)
    id    : { type: 'string', required: true, unique: true, primaryKey: true },   // also accepts any validations
    pw    : { type: 'string', required: true, maxLength: 10 },
    email : { type: 'email', required: true },  //문자열이 어댑터로 전달이 될 때, 특수한 type은 검증과 설정에 사용할 수 있습니다.
    like  : { type: "string", required: false },  //type: 'integer', min: 19
    좋아하는것: function() {  //여기에 인스턴스의 메소드도 정의할 수 있습니다.
      return "저는 " + this.like + "를 좋아합니다.";
    },
    pets  : { collection: "pettable", via: "주인" },  //pet테이블에서 "주인"컬럼을 참조하도록 함 (?) "1대 다" 관계를 만드는 중.
    seqNo : { type: "integer", autoIncrement: true, unique: true },
    가입일 : new Date(),
    autoPK : false,
    autoCreatedAt: true,
    autoUpdatedAt: true
  },
  // Lifecycle Callbacks
  // beforeValidate / afterValidate // beforeUpdate / afterUpdate // beforeCreate / afterCreate // beforeDestroy / afterDestroy
  beforeCreate: function(values, next) { console.log("User 도큐먼트 생성을 시작합니다."); next(); },  //비밀번호 암호화로직을 추가할수 있다.
  afterCreate: function(values, next) { console.log("User 도큐먼트 생성완료"); next(); },
  afterDestroy: function(values, next) { console.log("User 도큐먼트 삭제완료"); next(); },
  doSomething: function() {  // Class Method
    // Do something here
    console.log("두 썸띵 히어?");
  }
});

var petCollection = Waterline.Collection.extend({
  connection: "default",
  identity: "pettable",
  tableName: "pet",
  schema: true,
  adapter: "mongodb",
  attributes: {
   "펫 이름": { type: "string", required: true },
    주인: { model: "usertable" }  //유저테이블과 조인함으로써, "many-to-many 관계" 성립됨.
  },
  beforeCreate: function(values, next) { console.log("Pet 도큐먼트 생성을 시작합니다."); next(); },
  afterDestroy: function(values, next) { console.log("Pet 도큐먼트 삭제완료."); next(); },
  bark: function() { console.log(this["펫 이름"] + " : 왈왈"); }
});


var waterline = new Waterline();
waterline.loadCollection(userCollection);  //여기서 loadCollection() 메소드를 실행하면, 아래의 ontology로 들어옴.
waterline.loadCollection(petCollection);


var config = {
  adapters: {
    //'default': 'mongo',
    'mongo': require('sails-mongo')  //sails-몽고 모듈을 어댑터에 꽂음
  },
  connections: {
    default: {
      adapter: 'mongo',
      url: "mongodb://localhost:27017/mongoDBtest"  //기본적으로는 mongodb://url/sails 로 들어감.
    }
  }
};

waterline.initialize(config, function(err, ontology) {  //ontology변수는 컬렉션 객체를 가지고있음.
  if(err) { throw err; }
  //완전히 모델을 초기화해서 가지런하게 하자,
  var User = ontology.collections.usertable;  //쉽게말해서 바로가기를 추가하는것.
  var Pet  = ontology.collections.pettable;  //서버를 올릴때 에러는 안나는데, pettable이라는 tableName을 정의하지않았으면, 사용도 불가능하다.

  //이곳은 위에서 아래로 순차적으로 실행하지 않는다. 비동기로 실행하기때문에, Promise로서 어떤 순서대로 실행할지 약속은 되어있지만,
  //User.create를 실행한뒤에 .then을 한 뒤에 그 다음 .then()을 호출한다는 보장이 없다. 갑자기 User.destroy()를 호출한다.
  //그리고 CRUD로직 이외에는 모두 순차적으로 실행하는듯 하다. CRUD로직이 가장 나중에 실행되는 것 같다.

  User.create({  //테스트로 한번 생성해봄.
    id: "test00",
    pw: "00",
    email: "test@test.com",
    like: "오호라"
  }).then(function (user) { //첫번째 then 메소드의 인자로는, 생성된 해당 document인듯 하다.
    return Pet.create({
        "펫 이름": "testPet",
        주인: user.id
    });

  }).then(function (pet) { // Then we grab all users and their pets
    return User.find().populate('pets');  //각 사용자에 대한 애완 동물의 기록을 찾아갑니다...???

  }).then(function(users){ //이전의 then에서 return한 객체는 다음에 전달됨.
    console.dir(users);  //최초로 create한 테이블(유저테이블)의 모든 documents를 Array로 출력함.

  }).catch(function(err){ //오류가 발생하면, 바로 catch블록으로 이동함.
    console.log("오류발생!!!");
    console.error(err);
  });

  User.destroy({ id: "test00" })
    .exec(function (err) {  //destroy() 를 할때는 반드시 exec() 함수를 체인으로 호출해줘야한다.
      Pet.destroy({ "펫 이름": "testPet" })
        .exec(function (err) {  //destroy() 를 할때는 반드시 exec() 함수를 체인으로 호출해줘야한다. 그렇지않으면 삭제가 되지않는다.
          console.log("펫 삭제 콜백");
        });
    });
  app.models = ontology.collections;  //앱 전체에서 쓸수있도록 컬렉션과 커넥션을 삽입함.
  app.connections = ontology.connections;

  console.log("모든 initialize() 셋팅이 완료되었습니다.");
  //이 안에서는 트랜젝션이 걸리기 때문에, 중간에 에러가 나면 create했던것들은 모두 사라진다.
});



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
app.post("/testPOST", function(req, res) {
  console.log("\n ===== 테스트 post URL 접속 ===== \n");
  console.log(app.models);
  res.send(app);
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


//===============================================================================================================


app.get("/mongoDB", function(req, res) {
  console.log("몽고디비 테스트 URL 접속");
  res.sendFile(path.join(__dirname+"/public/mongoDBtest/mongoDBindex.html"));
});


app.get("/mongoDB/insert", function(req, res) {
  console.log("몽고디비 insert() AJAX 요청 들어옴");
  var result = null;
  var requestParam = {};
  requestParam.name = req.query.name;
  requestParam.age = req.query.age;
  requestParam.status = req.query.status;

  MongoClient.connect(mongoURL, function(err, db) {  //db.authenticate("rex", "1234", function(err, res) {
    //if (err) { console.log("에러 내용 ==> " + err); }
    //assert.equal(null, err);
    console.log("몽고디비 서버에 올바르게 연결되었음. insert를 시작해볼게요!");
    var collection = db.collection('testCollection');
    //collection.insertMany([
    //  {a : 1}, {a : 2}, {a : 3}
    collection.insert({
      name: requestParam.name,
      age: requestParam.age,
      status: requestParam.status,
    }, function(err, result) {
      //assert.equal(err, null);
      //assert.equal(3, result.result.n);  테스트용 모듈
      //assert.equal(3, result.ops.length);
      console.log("콜렉션에 insert 완료되었음!");
      console.log("결과물은?");
      console.log(result);
      db.close();
      console.log("몽고디비의 연결을 끊음.");
      res.send(result);
    });
  });
});



app.get("/mongoDB/find", function(req, res) {
  console.log("몽고디비 find() AJAX 요청 들어옴");
  var result = null;
  MongoClient.connect(mongoURL, function(err, db) {  //db.authenticate("rex", "1234", function(err, res) {
    // (err) { console.log("에러 내용 ==> " + err); }
    //assert.equal(null, err);
    console.log("몽고디비 서버에 올바르게 연결되었음. find를 시작해볼게요!");
    var collection = db.collection('testCollection');
    collection.find({}).toArray(function(err, docs) {  //★그냥 find일경우에는 toArray() 를 해줘야하고, findOne() 이면 그냥 써도된다.
      //assert.equal(err, null);  assert.equal(2, docs.length);  테스트용 모듈
      console.log("결과 독스는? ==> "+docs);  //console.dir(docs);
      result = docs;
      db.close();
      console.log("최종결과물");
      console.log(result);
      res.send(result);
    });
  });
  //res.send(result);
});

//=================================================================================================================

app.get("/mongoDBlogin", function(req, res) {
  console.log("몽고를 이용한 User 로그인 테스트 URL 접속");
  if (req.session.user_id) {
    res.redirect("/mongoDBlogin/getUser");
  }
  res.sendFile(path.join(__dirname+"/public/mongoDBuser/login.html"));  //로그인페이지로 보냄
});
app.get("/mongoDBlogin/createUser", function(req, res) {
  console.log("회원가입 페이지 출력");
  res.sendFile(path.join(__dirname+"/public/mongoDBuser/createUser.html"));  //회원가입페이지로 보냄
});

app.post("/mongoDBlogin/createUser", function(req, res) {
  console.log("회원가입 로직 시작");
  MongoClient.connect(mongoURL, function(err, db) {
    db.collection('user').insert({
      id: req.body.id,
      pw: req.body.pw,
      email: req.body.email,
      like: req.body.like
    }, function(err, result) {
      console.log("결과물은?");
      console.log(result);
      db.close();
      //res.send(result);
    });
  });
  res.sendFile(path.join(__dirname+"/public/mongoDBuser/login.html"));  //로그인페이지로 보냄
});

app.post("/mongoDBlogin/loginMongo", function(req, res) {
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

app.get("/mongoDBlogin/getUser", function(req, res) {
  console.log("내 정보 보기 페이지 보내기");
  if (!req.session.user_id) {  //세션이 존재하지 않으면
    res.redirect("/mongoDBlogin");  //로그인페이지로 보냄
  }
  res.sendFile(path.join(__dirname+"/public/mongoDBuser/read&updateUser.html"));
});

app.get("/mongoDBlogin/getUser/getCurrentUser", function(req, res) {
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

app.get('/mongoDBlogin/sessionReset', function(req, res) {  //세션시간을 체크하는 request
  res.send(req.session.cookie.maxAge / 1000+"");  //문자열로 보내주어야 Ajax에서 responseText로 받을수 있다.
});

app.get('/mongoDBlogin/sessionCheck', function(req, res) {  //세션시간을 체크하는 request
  res.send(req.session.cookie.maxAge / 1000+"");  //문자열로 보내주어야 Ajax에서 responseText로 받을수 있다.
});

app.get("/mongoDBlogin/getUser/logout", function(req, res) {
  console.log("로그아웃을 진행합니다.");
  console.log(req.session);
  delete req.session.user_id;
  res.redirect("/mongoDBlogin/getUser");
});

app.post("/mongoDBlogin/getUser/update", function(req, res) {
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

app.get("/mongoDBlogin/getUser/deleteUser", function(req, res) {
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


//===============================================================================


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
