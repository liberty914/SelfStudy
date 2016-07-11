
'use strict' //엄격하게 문법을 검사


// ★★★ JS의 모든 이벤트이름 ==> http://www.w3schools.com/tags/ref_eventattributes.asp


//표준 이벤트모델 ==> 2개 이상의 onload 이벤트를 사용할 수 있다!
//                    고전모델과 비교했을때 로딩의 순서는 동일하다. (위에서 아래로 순차진행)
var myFunction = function() {
  var body = document.getElementsByTagName('body');                        //body엘리먼트를 가져오고
  body[0].innerHTML = '<p>'+location.pathname+'</p>' + body[0].innerHTML;  //경로명을 붙임!
  document.getElementById('main_footer').innerHTML += '<p>로딩 중</p>';
};
window.addEventListener('load', myFunction, false);  // 이벤트이름, 콜백함수, 캡쳐링/버블링 사용여부(default:false) 를 설정



//고전 이벤트모델 ==> 다른곳에서 중첩되어 window.onload 속성을 건드릴 경우,
//                    가장 마지막에 읽혀지는 하나만 로드된다. 주의! (표준을 쓰는것이 좋다)
window.onload = function() {
  document.getElementById('main_footer').innerHTML += '<p>로딩 완료</p>';
  var radio = document.createElement('input');                //라디오버튼을 만들고
  radio.type = 'radio';                   //방법1
  radio.setAttribute('checked', 'true');  //방법2
  document.getElementById('main_footer').appendChild(radio);  //footer에 연결한 후,
  document.getElementById('main_footer').lastChild.focus();   //focus를 준다!
};



//화면 출력, 콘솔창, 경고창띄우기용 모듈
function test() {
  var mainFooter = document.getElementById('main_footer');
  for(var i=0; i<arguments.length; i++) {
	mainFooter.innerHTML 
	  += '<p>test['+i+'] ==> '+arguments[i]+'</p>';  //화면출력
	console.log(arguments[i]);                       //콘솔창
	alert(arguments[i]);                             //경고창
  }
  mainFooter.innerHTML += '<br/>';  //한줄 추가
}







/*
    < 'use strict'; (엄격모드) 에서 사용할수 없는 구문 (Not Allowed in Strict Mode) >
  
  
  1. x = 3.14;  ==> var 키워드로 선언하지 않고 변수를 사용하는것은 허용되지 않습니다.
  
  2. delete x;  ==> 변수/함수/인수의 삭제가 허용되지 않습니다.
  
  3. var x = { p1:10, 
               p1:20 };  ==> 똑같은 Property의 재정의는 허용되지 않습니다.
  
  4. function x(p1, p1) {};   ==> Parameter이름의 중복사용이 허용되지 않습니다.
  
  5. var x = 010;
     var y = \010;  ==> 진수 숫자 리터럴 탈출 문자는 허용되지 않습니다.
  
  6. var obj = {};
     obj.defineProperty(obj, 'x', {value:0, writable:false});
     obj.x = 3.14;  ==> 읽기 전용 속성을 초기화시키는 것은 허용되지 않습니다.
  
  7. var obj = {get x() {return 0} };
     obj.x = 3.14;  ==> GET 전용 속성을 초기화시키는 것은 허용되지 않습니다
  
  8. delete Object.prototype;  ==> 삭제할수 없는 속성을 삭제하는 것은 허용되지 않습니다
  
  9. var eval = 3.14;  ==> 문자열 'eval'은 변수명으로 사용할 수 없습니다.
  
  10. var arguments = 3.14;  ==> 문자열 'arguments'는 변수명으로 사용할 수 없습니다.
  
  11. with (Math){x = cos(2)};  ==> with문은 허용되지 않습니다.
  
  12. eval ('var x = 2');
      alert (x)  ==> 보안상의 이유로, eval()함수가 호출된 범위(scope)에서 변수를 만들 수 없습니다.
  
  13. 미래에 예약어(키워드)는 허용되지 않습니다.
    implements
    interface
    package
    private
    protected
    public
    static
    field
*/