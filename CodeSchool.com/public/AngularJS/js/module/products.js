"use strict";

(function() {

  var app = angular.module("store-directives", []);

  //커스텀 디렉티브 생성! 이름과 함수를 전달
  //Javascript ==> 카멜케이스  //  HTML ==> dash 로 번역(translate)됨
  app.directive("productSpecs", function() {
    return {  //option을 가진 객체를 리턴
      restrict: "E",  //Element Directive
      templateUrl: "include/product-specs.html"
      //여기의 경로는 이 js파일에서부터가 아니라, 렌더링되는 html파일에서부터이다. (index.html 기준)
    };
  });


  app.directive("productReviews", function() {
    return {  //option을 가진 객체를 리턴
      restrict: "A",  //Attribute Directive
      templateUrl: "include/product-reviews.html"
    };
  });


  app.directive("productTabs", function() {
    return {
      restrict: "E",
      templateUrl: "include/product-tabs.html",
      controller: function() {  //TabController 의 내용을 그대로 가져옴!
        /// Field
        this.tab = 1;

        /// Getter & Setter
        this.setTab = function (tabNum) {
          this.tab = tabNum;
        };
        this.getTab = function () {
          return this.tab;
        }
        this.isTab = function (tabNum) {
          return this.tab === tabNum;
        };
      },
      controllerAs: "tab"  //TabController 를 tab 으로 alias
    };
  });


  app.directive("productGallery", function() {
    return {
      restrict: "E",
      templateUrl: "include/product-gallery.html",
      controller: function() {  //GalleryController 의 내용을 그대로 가져옴!
        this.current = 0;
        this.setCurrent = function (sss) {
          this.current = 0;
          if (sss) {
            this.current = sss;
          }
        };
      },
      controllerAs: "gallery"
    };
  });

})();