/*
Directive  ==>  자바스크립트 behaviors의 HTML annotation
Module  ==>  Application 컴포넌트 live
            모듈을 나누는 최고의 방법은 '기능별' 로 나누는 것이다.
            app.js 는 top-level 모듈로서 ng-app에 붙이는 역할을 한다.
            products.js 는 products에 대한 모든 기능들이 담겨있다. (only products)
            반드시 closure 로 묶어주어 변수의 충돌(var app...)을 방지하며, 분리시킨다.
Controller  ==>  app의 behavior
Expression  ==>  페이지 내부에서 값을 어떻게 보여줄지 결정
Filter  ==>  {{ data | filter: options }} 의 형식으로 사용
            {{"1388123412323" | data: "MM/dd/yyyy @ h:mma"}}  ==>  12/27/2013 @ 12:50AM
            {{"octagon gem" | uppercase}}  ==>  OCTAGON GEM
            {{"My Description" | limitTo: 8}}  ==>  My Descr

            <li ng-repeat="product in store.products | limitTo: 3">
            <li ng-repeat="product in store.products | orderBy: '-price'">
Model  ==>  <input type="checkbox" ng-model="true|false" />
            <input type="radio" value="aaa" ng-model="aaa" />
Service  ==>  컨트롤러에 기능성(functionality)을 부여한다. ($ sign을 사용)
              $http --> JSON Data를 웹서비스로브터 가지고온다.
                $http({method: "GET", url: "/products.json"});  //요청만 할때
                $http.get("/products.json", { apiKey: "myApiKey" });  //parameter를 전달할 때
                .success() & .error()
              $log --> Logging messages를 자바스크립트 console에 남긴다.
              $filter --> Array를 필터링한다.
*/
"use strict";

(function() {

  var app = angular.module("gemStore", ["store-directives"]);

  //controller는 카멜케이스중 class의 네이밍룰을 적용
  app.controller("StoreController", ["$http", function($http) {  //★ DI(Dependency Injection)
    /// Field
    //this.products = gems;  $http 서비스로 받아오는것으로 대체되었음.

    var store = this;
    store.products = [];  //this.products 와 동일

    $http.get("js/store-products.json").success(function(data) {
      store.products = data;
    });
  }]);

  // app.controller("TabController", function() {
  // });  디렉티브 productTabs 으로 이동함.

  // app.controller("GalleryController", function() {
  // });  디렉티브 productGallery 로 이동함.

  app.controller("ReviewController", function() {
    this.review = {};
    this.createReview = function(product) {
      console.log(Date.now());
      this.review.createdOn = Date.now();
      product.reviews.push(this.review);  //Scope로 연결이 되어있음.
      this.review = {};
    };
  });



  //variable을 아래에 선언해도 위의 컨트롤러에 적용이 가능하다!
  //var gems = []

})();