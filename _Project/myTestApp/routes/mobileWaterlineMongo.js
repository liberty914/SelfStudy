var express = require('express');
var router = express.Router();  //라우팅에대한 정보를 리턴해줌, 우리는 여기에 라우팅을 덧붙일수 있다.
var path = require('path');
var Waterline = require('waterline');  //워터라인 모듈
var session = require("express-session");



router.use( session( {  //세션 생성
  //genid: function(req) { return genuuid(); },  //uid-safe 의존라이브러리를 이용해서 사용하는듯.
  secret: "secret_key",  //유저의 id로 세션을 관리
  key: "Rex",
  cookie: {maxAge: 1000*60*1},  //1분동안
  resave: true,  //false로 하면 request를 여러번해도 시간초과시 세션이 사라짐. true일경우, 리퀘스트마다 다시 시간이 초기화됨.
  saveUninitialized: true  //초기화되지않은 세션을 강제로 세션 저장소에 저장할 것인지.
}));



//워터라인 Collection 정의하기, 이를 model 이라고 하는듯 하다.
var userCollection = Waterline.Collection.extend({
  connection: "default",
  identity: "usertable",  //대문자를 써도 소문자로만 인식함. waterline.initialize()메소드에서 ontology.collections.usertable 로 사용
  tableName: 'user',   // Define a custom table name (테이블명 정의, mongoDB에서 실제 사용할 Collection이름)
  schema: true,        // Set schema true/false for adapters that support schemaless
  adapter: 'mongodb',  // Define an adapter to use (사용할 데이터베이스 정의)
  attributes: {        // Define attributes for this collection (컬럼을 정의)
    //의문점, "id" 컬럼을 사용하면 "_id"로 들어간다. 왜일까? 그리고 컬럼명으로 "id" 를 쓰지않으면 "_id" 컬럼에 해시값이 들어간다.
    아이디    : { type: 'string', required: true, unique: true, primaryKey: true },  //여러가지 validation을 걸어둘수있다.
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
  afterValidate: function(values, next) { console.log("User 도큐먼트 Validate완료"); next(); },
  beforeCreate: function(values, next) { console.log("User 도큐먼트 Create를 시작합니다."); next(); },  //비밀번호 암호화로직을 추가할수 있다.
  afterCreate: function(values, next) { console.log("User 도큐먼트 Create완료"); next(); },
  afterUpdate: function(values, next) { console.log("User 도큐먼트 Update완료"); next(); },
  afterDestroy: function(values, next) { console.log("User 도큐먼트 Destroy완료"); next(); },
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
  beforeCreate: function(values, next) { console.log("Pet 도큐먼트 Create를 시작합니다."); next(); },
  afterDestroy: function(values, next) { console.log("Pet 도큐먼트 Destroy완료."); next(); },
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
    아이디: "test00",
    pw: "00",
    email: "test@test.com",
    like: "오호라, 워터라인 체킹용 유저"
  }).then(function (user) { //첫번째 then 메소드의 인자로는, 생성된 해당 document인듯 하다.
    return Pet.create({
        "펫 이름": "testPet",
        주인: user.id
    });

  }).then(function (pet) { // Then we grab all users and their pets
    return User.find().populate('pets');  //각 사용자에 대한 애완 동물의 기록을 찾아갑니다...???
    //뭔지는 모르겠으나, 일단은 모든 user테이블의 document들을 출력해준다.

  }).then(function(users){ //이전의 then에서 return한 객체는 다음에 전달됨.
    console.dir(users);  //최초로 create한 테이블(유저테이블)의 모든 documents를 Array로 출력함.

  }).catch(function(err){ //오류가 발생하면, 바로 catch블록으로 이동함.
    console.log("오류발생!!!");
    console.error(err);
  });

  User.destroy({ 아이디: "test00" })
    .exec(function (err) {  //destroy() 를 할때는 반드시 exec() 함수를 체인으로 호출해줘야한다.
      Pet.destroy({ "펫 이름": "testPet" })
        .exec(function (err) {  //destroy() 를 할때는 반드시 exec() 함수를 체인으로 호출해줘야한다. 그렇지않으면 삭제가 되지않는다.
          console.log("펫 삭제 콜백, Waterline 테스트 완료!");
        });
    });
  router.models = ontology.collections;  //앱 전체에서 쓸수있도록 컬렉션과 커넥션을 삽입함.
  router.connections = ontology.connections;

  //이 안에서는 트랜젝션이 걸리기 때문에, 중간에 에러가 나면 create했던것들은 모두 사라진다.
  console.log("Waterline의 initialize() 셋팅이 완료되었습니다.");
});



//=====================================================================================================================================



router.get("/", function(req, res) {
  console.log("워터라인을 이용한 User 로그인 테스트 URL 접속");
  if (req.session.user_id) {
    res.redirect("/mobileWaterlineMongo/getUser");
  }
  res.sendFile(path.join(__dirname+"/../public/mobileWaterlineMongo/login.html"));  //로그인페이지로 보냄
});


router.get("/createUser", function(req, res) {
  console.log("회원가입 페이지 출력");
  res.sendFile(path.join(__dirname+"/../public/mobileWaterlineMongo/createUser.html"));  //회원가입페이지로 보냄
});


router.post("/createUser", function(req, res) {
  console.log("회원가입 로직 시작");
  var d = new Date();
  router.models.usertable.create({
    아이디: req.body.id,
    pw   : req.body.pw,
    email: req.body.email,
    like : req.body.like,
    좋아하는것: function() {  //여기에 인스턴스의 메소드도 정의할 수 있습니다.
      return "저는 " + this.like + "를 좋아합니다.";
    },
    //pets  : { collection: "pettable", via: "주인" },  //pet테이블에서 "주인"컬럼을 참조하도록 함 (?) "1대 다" 관계를 만드는 중.
    seqNo : 0,  //어떻게 주라는거야!!!
    가입일 : d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 "
            + d.getHours() + "시 " + d.getMinutes() + "분 " + d.getSeconds() +"초"
  }).catch(function(err){ //오류가 발생하면, 바로 catch블록으로 이동함.
    console.log("오류발생!!!");
    console.error(err);
  });
  res.sendFile(path.join(__dirname+"/../public/mobileWaterlineMongo/login.html"));  //로그인페이지로 보냄
});


router.post("/loginMongo", function(req, res) {
  console.log("로그인 유효성체크");
  console.log(req.session);
  router.models.usertable.findOne({  //1개만 찾음
    아이디: req.body.id  //where 조건
  }).exec(function(err, document) {  //exec() 메소드의 document로 방금 생성된 객체가 들어온다.
    console.log("결과물은?");
    console.log(document);  //object가 들어옴
    result = 0;  //id부터 틀린상태 (find()의 결과물이 없는경우)
    if (document && document.아이디 === req.body.id) {
      result = 1;  //id는 존재하지만, 비밀번호는 틀린상태
      if (document.pw === req.body.pw) {
        result = 2;  //id와 pw가 정확히 맞은 상태 (로그인가능)
        req.session.user_id = document.아이디;  //세션 부여
        console.log("현재 로그인된 세션 ==> "+req.session.user_id);
      }
    }
    console.log("결과값은 ==> "+result);
    res.send(new Array(result, document));  //배열의 [0]은 상태값, [1]은 find()된 object
  });
});


router.get("/getUser", function(req, res) {
  console.log("내 정보 보기 페이지 보내기");
  if (!req.session.user_id) {  //세션이 존재하지 않으면
    res.redirect("/mobileWaterlineMongo");  //로그인페이지로 보냄
  }
  res.sendFile(path.join(__dirname+"/../public/mobileWaterlineMongo/read&updateUser.html"));
});


router.get("/getUser/getCurrentUser", function(req, res) {
  console.log("로그인한 유저의 내 정보 보기");
  console.log(req.session);
  router.models.usertable.findOne({  //1개만 찾음
    아이디: req.session.user_id  //where 조건
  }).exec(function(err, document) {
    console.log(document);
    res.send(document);
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
  res.redirect("/mobileWaterlineMongo/getUser");
});


router.post("/getUser/update", function(req, res) {
  console.log("유저정보 업데이트를 진행합니다.");
  console.log(req.session);
  console.log(req.body);
  router.models.usertable.update(
    { 아이디: req.session.user_id },  //where조건
    { pw: req.body.pw,
      email: req.body.email,  //변경할 컬럼
      like: req.body.like
  }).exec(function(err, data) {
    console.log(data)
    if (data) { console.log("업데이트 성공!"); }
    res.redirect("/mobileWaterlineMongo/getUser");
  });
});


router.get("/getUser/deleteUser", function(req, res) {
  console.log("유저의 회원탈퇴를 진행합니다.");
  console.log(req.session);
  console.log(req.body);
  router.models.usertable.destroy({
    아이디: req.session.user_id  //where조건
  }).exec(function(err, data) {
    console.log(data);
    if (data) { console.log("회원탈퇴 성공!"); }
    delete req.session.user_id;
    res.redirect("/mobileWaterlineMongo/getUser");
  });
});



module.exports = router;