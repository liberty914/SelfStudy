
//받는 함수 ==> socket.on("이벤트명", 콜백함수)
//보내는 함수 ==> socket.emit("이벤트명", 보낼데이터)  * emit: (빛.열.소리 등을)내다, 발하다, (신호.영상을)발신하다, 송신하다

(function() {

var socket = io();
var myTalkName = null;
var finalTalk = null;
var m = document.getElementById("m");
var messages = document.getElementById("messages");
var submitBtn = document.getElementById("submitBtn");
//console.log(socket);

document.getElementById("loginForm").onsubmit = function () {
  myTalkName = document.getElementById("login").value;
  socket.emit("newFace join", myTalkName);  //보낼 때 (대화명을 담아서 보냄)
  //document.getElementById("loginBox").classList.add("slide-down");
  document.getElementById("loginBox").style.height = 0;
  this.style.display = "none";
  this.action = "javascript:";
  return false;
};

socket.on("newFace join", function(talkName) {
  var notice = document.createElement("div");
  notice.innerHTML = talkName+"님이 입장하셨습니다.";
  notice.classList.add("notice");
  messages.appendChild(notice);
  notice.scrollIntoView();
});

socket.on("out", function(talkName) {
  var notice = document.createElement("div");
  notice.innerHTML = talkName+"님이 퇴장하셨습니다.";
  notice.classList.add("notice");
  messages.appendChild(notice);
  notice.scrollIntoView();
});



m.onkeyup = function (e) {
  if (m.value.length < 1) {
    submitBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
  }
};

document.getElementById("form").onsubmit = function() {
  if (m.value.length > 0) {
    socket.emit("chat message", m.value);  //보낼 때
    m.value = "";
  }
  submitBtn.disabled = true;
  m.focus();
  return false;
};

socket.on("chat message", function(obj) {  //받을 때
  var messageContainer = document.createElement("li");
  var message = document.createElement("span");
  message.innerHTML = obj.msg;
  if (myTalkName === obj.talkName) {
    message.className = "me";
  } else {
    if (finalTalk !== obj.talkName) {
      var name = document.createElement("em");  //나의 메세지가 아닐경우에만 생성함.
      var nameWrap = document.createElement("div");
      name.innerHTML = obj.talkName;
      name.className = "not-me";
      nameWrap.appendChild(name);
      messageContainer.appendChild(nameWrap);
    }
    message.className = "not-me";
  }
  messageContainer.appendChild(message);
  messages.appendChild(messageContainer);
  message.scrollIntoView();
  finalTalk = obj.talkName;  //마지막 대화한사람을 저장함. (중복된 대화명선언을 막기위해)
});

})();