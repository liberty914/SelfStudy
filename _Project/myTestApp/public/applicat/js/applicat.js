
"use strict";

(function() {

  var scrollOpacity = function (obj, minScrollY, maxScrollY) {
    if (minScrollY < window.pageYOffset && window.pageYOffset < maxScrollY ) {
      for ( var i=0; i<obj.length; i++) {
        obj[i].style.opacity = "1";
      }
    } else {
      for ( var i=0; i<obj.length; i++) {
        obj[i].style.opacity = "0";
      }
    }
  };

  window.addEventListener("load", function() {

    var bgChange = document.querySelector("#process .third .content");
    var red = 255;
    var green = 0;
    var blue = 255;
    var swi = true;
    window.addEventListener("scroll", function () {
      scrollOpacity(document.querySelectorAll("#who-we-are .second .content img"), 880, 1600);
      scrollOpacity(document.querySelectorAll("#who-we-are .fourth .content img"), 2160, 2880);
      scrollOpacity(document.querySelectorAll("#who-we-are .fifth .content .art"), 2600, 3280);
      scrollOpacity(document.querySelectorAll("#what-we-do .third .content .technic:nth-of-type(1)"), 3900, 4600);
      scrollOpacity(document.querySelectorAll("#what-we-do .third .content .technic:nth-of-type(2)"), 4000, 4700);
      scrollOpacity(document.querySelectorAll("#what-we-do .third .content .technic:nth-of-type(3)"), 4100, 4800);
      scrollOpacity(document.querySelectorAll("#what-we-do .third .content .technic:nth-of-type(4)"), 4200, 4900);
      scrollOpacity(document.querySelectorAll("#what-we-do .third .content .technic:nth-of-type(5)"), 4300, 5000);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(1)"), 4600, 5400);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(2)"), 4800, 5600);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(3)"), 5000, 5800);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(4)"), 5200, 6000);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(5)"), 5400, 6200);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(6)"), 5600, 6400);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(7)"), 5800, 6600);
      scrollOpacity(document.querySelectorAll("#process .second .content .process-box:nth-of-type(8)"), 6000, 6800);
      if (swi) {
        if (blue < 1) {
          swi = false;
        }
        red -= 5;
        green += 5;
        blue -= 5;
      } else {
        if (blue > 254) {
          swi = true;
        }
        red += 5;
        green -= 5;
        blue += 5;
      }

      bgChange.style.backgroundColor = "rgb("+red+", "+green+", "+blue+")";
    });

    //=========================================================================================================

    var swipeBox = document.querySelectorAll("#what-we-do .second .swipe-container .swipe-box")[0];
    var swipeStartX = 0;
    var swipeEndX = 0;
    console.log(swipeBox);
    swipeBox.addEventListener("drag", function(e) {
      console.log("드래그 중");
      swipeStartX = e.pageX;
      console.log(swipeStartX);
      this.style.transform = "translate3d(0px, 0px, 0px)";
    });
    // swipeBox.addEventListener("dragend", function(e) {
    //   console.log("드래그 끝");
    //   swipeEndX = e.pageX;
    //   console.log(swipeEndX);
    //   console.log("스와이프 ==> "+ (swipeStartX - swipeEndX));
    //   this.style.transform = "translate3d(-100%, 0px, 0px)";
    // });

    var swipeButtonLeft = document.querySelector("#what-we-do .second .swipe-container .swipe-button-left");
    var swipeButtonRight = document.querySelector("#what-we-do .second .swipe-container .swipe-button-right");
    var swipePercent = 0;
    swipeButtonLeft.addEventListener("click", function() {
      swipePercent += 100;
      if (swipePercent > 0) {
        swipePercent = -200;
      }
      bulletState(swipePercent);
      swipeBox.style.transform = "translate3d("+swipePercent+"%, 0px, 0px)";
    });
    swipeButtonRight.addEventListener("click", function() {
      swipePercent += -100;
      if (swipePercent < -200) {
        swipePercent = 0;
      }
      bulletState(swipePercent);
      swipeBox.style.transform = "translate3d("+swipePercent+"%, 0px, 0px)";
    });

    var swipeBullet = document.querySelectorAll("#what-we-do .second .swipe-container .swipe-pagination-box .swipe-pagination-bullet");

    var bulletState = function (page) {
      switch (page) {
        case 0:
          swipeBullet[0].style.backgroundColor = "hotpink";
          swipeBullet[1].style.backgroundColor = "white";
          swipeBullet[2].style.backgroundColor = "white";
          break;
        case -100:
          swipeBullet[0].style.backgroundColor = "white";
          swipeBullet[1].style.backgroundColor = "hotpink";
          swipeBullet[2].style.backgroundColor = "white";
          break;
        case -200:
          swipeBullet[0].style.backgroundColor = "white";
          swipeBullet[1].style.backgroundColor = "white";
          swipeBullet[2].style.backgroundColor = "hotpink";
          break;
      }
    };
    swipeBullet[0].style.backgroundColor = "hotpink";
    for (var i=0; i<swipeBullet.length; i++) {
      swipeBullet[i].addEventListener("click", function() {
        this.style.backgroundColor = "hotpink";
      });
    }
    swipeBullet[0].addEventListener("click", function() {
      swipePercent = 0;
      bulletState(swipePercent);
      swipeBox.style.transform = "translate3d("+swipePercent+"%, 0px, 0px)";
    });
    swipeBullet[1].addEventListener("click", function() {
      swipePercent = -100;
      bulletState(swipePercent);
      swipeBox.style.transform = "translate3d("+swipePercent+"%, 0px, 0px)";
    });
    swipeBullet[2].addEventListener("click", function() {
      swipePercent = -200;
      bulletState(swipePercent);
      swipeBox.style.transform = "translate3d("+swipePercent+"%, 0px, 0px)";
    });

    //=========================================================================================================

    var scrollSmooth = function (목적지, 몇초동안) {
      var 현재위치 = window.pageYOffset;
      var 남은거리 = 목적지 - 현재위치;
      var 단일이동거리 = 남은거리/60;
      var goScrollDown = function () {
        if (현재위치 > 목적지) { return; }
        현재위치 += 단일이동거리;
        window.scrollTo(0, 현재위치)
      };
      var goScrollUp = function () {
        if (현재위치 < 목적지) { return; }
        현재위치 += 단일이동거리;
        window.scrollTo(0, 현재위치)
      };
      if (남은거리 > 0) {
        setInterval(goScrollDown, 몇초동안/180);
        setTimeout(function() {
          clearInterval(goScrollDown);
        }, 몇초동안);
      } else {
        setInterval(goScrollUp, 몇초동안/180);
        setTimeout(function() {
          clearInterval(goScrollUp);
        }, 몇초동안);
      }
    };


    var whoWeAre = document.querySelector("header nav ul li:nth-child(1) a");
    whoWeAre.onclick = function() {
      setInterval(scrollSmooth(580, 1000));
    };

    var whatWeDo = document.querySelector("header nav ul li:nth-child(2) a");
    whatWeDo.onclick = function() {
      setInterval(scrollSmooth(3500, 1000));
    };

    var process = document.querySelector("header nav ul li:nth-child(3) a");
    process.onclick = function() {
      setInterval(scrollSmooth(4900, 1000));
      //document.getElementById("process").scrollIntoView();
    };
  });


})();

