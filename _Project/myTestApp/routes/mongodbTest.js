var express = require('express');
var router = express.Router();  //라우팅에대한 정보를 리턴해줌, 우리는 여기에 라우팅을 덧붙일수 있다.
var path = require('path');
var MongoClient = require("mongodb").MongoClient  //몽고DB로 접속하려는 클라이언트객체
  , assert = require("assert")  //Java에서 사용하던 assert 테스트모듈과 동일한 라이브러리.
  , mongoURL = "mongodb://localhost:27017/mongoDBtest";  //몽고DB의 서버URL과 DB의 주소



router.get("/", function(req, res) {
  console.log("몽고디비 테스트 URL 접속");
  res.sendFile(path.join(__dirname+"/../public/mongoDBtest/mongoDBindex.html"));
});


router.get("/insert", function(req, res) {
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


router.get("/find", function(req, res) {
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



module.exports = router;