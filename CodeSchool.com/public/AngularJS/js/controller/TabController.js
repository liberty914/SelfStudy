(function () {

  var app = angular.module("gemStore", []);

  app.controller("TabController", function() {
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
  });

});