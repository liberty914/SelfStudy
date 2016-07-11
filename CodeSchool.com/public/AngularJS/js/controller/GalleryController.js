(function() {

  var app = angular.module("gemStore", []);

  app.controller("GalleryController", function() {
    this.current = 0;
    this.setCurrent = function (sss) {
      this.current = 0;
      if (sss) {
        this.current = sss;
      }
    };
  });

});
