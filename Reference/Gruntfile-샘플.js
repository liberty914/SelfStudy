module.exports = function(grunt) {

    "use strict";  //왜 여기다가 쓰는지는 이해하지 못했음...

    require("time-grunt")(grunt);
    //grunt의 작업시간이 얼마나 걸리는지 콘솔창에 보여줌. 2번째 인자로 콜백함수를 전달하여 타이밍 통계를 수집할 수 있다.


    //아래에서 사용된 모든 grunt모듈을 로딩 (package.json 파일의 devDependencies에 존재)
    grunt.loadNpmTasks("grunt-htmlhint");
    grunt.loadNpmTasks("grunt-includes");  // HTML task

    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-csslint");
    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-csscomb");
    grunt.loadNpmTasks("grunt-contrib-cssmin");  // CSS task

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");  // JavaScript task

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-imagemin");  // other task

    grunt.loadNpmTasks("grunt-newer");  //참고.. newer task는 어떤 설정도 필요치않는다. 사용하려면 다른 task가 실행될 때 newer를 첫번째 인수로 추가만 해주면 된다.
    grunt.loadNpmTasks("grunt-concurrent");  // optimization(최적화) task

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");  // watch task

    //require("load-grunt-tasks")(grunt);
    /*  글로빙 패턴(globbing patterns) 을 사용하여, 여러개의 grunt 태스크를 로드합니다.
        Grunt는 기본적으로 grunt.loadNpmTasks("모듈명"); 메소드를 호출함으로 모듈을 로드하는데,
        로드할 모듈이 많아지면 모듈이름마다 메소드를 호출해야하기 때문에 라인수가 많아진다.
        load-grunt-tasks 모듈을 사용하면 간단하게 한줄만 사용하면 된다. 추가적으로 모듈을 로드하지 않아도 된다.
        이 모듈은 package.json 의 dependencies/devDependencies/peerDependencies/optionalDependencies 를 읽고,
        제공된 패턴과 일치하는 그런트 작업을 로드합니다.
        하지만, 어떤 모듈이 사용되었는지 한눈에 파악하기 어려운 단점이 존재합니다. 그래서 비추합니다.     */
        //다양한 사용 예제는 링크 참조 --> https://github.com/demun/demun.github.com/wiki/08_04_load_grunt_tasks



    grunt.config.init({  //grunt.initConfig() 메소드와 동일하다.
        pkg: grunt.file.readJSON("package.json"),
        banner: "/*!\n" +
        " ======================================================================== \n" +
        " * Project   : <%= pkg.name %>(<%= pkg.description %>) v<%= pkg.version %>\n" +
        " * Publisher : <%= pkg.make.publisher %> (<%= pkg.make.email %>), (<%= pkg.make.blog %>)\n" +
        " * Build     : <%= grunt.template.today('yyyy-mm-dd') %>\n" +
        " * License   : <%= pkg.license.type %> (<%= pkg.license.url %>)\n" +
        " ======================================================================== \n" +
        " */\n",
       // ========================================================================  이와같이 만들어짐.
       // * Project   : GruntTemplate(Grunt 를 사용하기 위한 예제 템플릿) v0.0.1
       // * Publisher : Ho, Jong-Mun (hjm01@naver.com), (http://demun.tistory.com)
       // * Build     : 2016-02-01
       // * License   : CC BY-ND (http://creativecommons.org/licenses/by/2.0/kr/)
       // ========================================================================


        // 1. npm install 작업모듈명 --save-dev
        // 2. grunt.loadNpmTasks("작업모듈명");


        //=======================================================================================================================================


        /* 기본적으로 아래의 task들은 (콘솔: grunt 작업명 [작업명]) 명령어로 각각 개별적으로 실행할 수 있다.
            예: grunt includes htmlhint    */


        // HTML task
        includes: {  //말 그대로 인클루드, include "../include/head.html" 라고 쓰면 해당 파일의 내용이 그대로 들어간다. (들여쓰기까지 유지된다.)
            build: {
                cwd: "workspace/docs/html/",  //대상 설정, html폴더의 하위폴더&파일의 모든 html파일에 include기능을 적용.
                src: ["**/*.html"],  //대상 설정, 모든 html파일을 인클루드 가능
                dest: "dist",  //결과파일 설정, html폴더의 하위폴더부터 동일한 폴더구조로, include된 완성본을 dist폴더로 이동시킴.
                options: {
                    flatten: true,  //대상 디렉토리에 있는 모든 파일소스를 병합하여 나열함. (source/file/path.html은 path.html처럼 짧게 변경)
                    // debug: true,  //디버그 모드로 컴파일함. include된 파일의 경로가 표시됨.
                    includePath: "workspace/docs/include/"  //include할 파일이 모여있는 장소, 인클루드 문에 사용된 상태경로를 기본 디렉토리로 지정합니다.
                }
            }
        },

        htmlhint: {  //작성한 html코드의 오류 검증, 최적화 판단 및 관리
            options: {
                htmlhintrc: "gruntConfig/.htmlhintrc"  //htmlhint의 옵션파일은 grunt폴더의 .htmlhintrc파일에 있음.
            },
            dist: "dist/**/*.html"  //대상 설정, 이 폴더를 검증함. dist폴더의 모든폴더의 .html파일을 검증.
        },
        // end of HTML task


        //=======================================================================================================================================


        // CSS task
        less: {
            dist: {  //적용되는 영역 (district)
                options: {
                    banner: "<%= banner %>",  //grunt.template.process 로 컴파일된 모든 파일 앞부분에 문자열로 추가됩니다.
                    dumpLineNumbers : "comments"  //디버깅하기 쉽도록 less파일의 라인수를 css파일에 적도록함.
                },
                src: "workspace/less/style.less",  //대상 설정, 이 위치의 less파일을
                dest: "workspace/css/style.css"  //결과파일 설정, 이 위치의 css파일로 변환 및 생성
            },
        },

        // sass: {                              // Task
        //     options: {                       // Target options
        //         style: "expanded"
        //     },
        //     dist: {  //적용되는 영역 (district)
        //         src: "workspace/sass/test.scss",  //대상 설정, 이 파일을
        //         dest: "workspace/css/test.css"  //결과파일 설정, 이 파일로 변환 및 생성
        //     }
        // },

        csslint: {  //css의 오류를 검사하는 모듈
            options: {
                csslintrc: "gruntConfig/.csslintrc"  //옵션파일은 grunt폴더의 .csslintrc 파일에 JSON형식으로 기재되어있음.
                //이 설정에 대한 설명은 https://github.com/demun/demun.github.com/wiki/04_02_grunt_contrib_csslint 를 참조.
            },
            dist: {  //적용되는 영역 (district)
                src: "workspace/css/style.css"  //대상 설정, 이 파일의 오류를 .csslintrc 파일로 검사함. 바로 위 작업의 "<%= less.dist.dest %>" 라고 쓰는것도 가능함.
            }
        },

        autoprefixer: {  //크로스 브라우징에 맞게, 각 브라우저의 벤더 프리픽스를 삽입하는 모듈
            options: {
                browsers: [
                    "Android 2.3",
                    "Android >= 4",
                    "Chrome >= 20",
                    "Firefox >= 24", // Firefox 24 is the latest ESR
                    "Explorer >= 8",
                    "iOS >= 6",
                    "Opera >= 12",
                    "Safari >= 6"
                ]
            },
            dist: {  //적용되는 영역 (district)
                src: "workspace/css/style.css",  //대상 설정, 이 폴더의 css파일을
                dest: "dist/css/style.css"  //결과파일 설정, 이 폴더의 css파일로 변환 및 생성
            }
        },

        csscomb: {  //CSS의 속성을 특정 순서로 정렬해주는 모듈 (font속성 다음에 background 속성이 와야한다던지...?)
            options: {
                config: "gruntConfig/.csscomb.json"  //옵션파일은 grunt폴더의 .csscomb.json 파일에 JSON형식으로 기재되어있음.
            },
            dist: {  //적용되는 영역 (district)
                src: "<%= autoprefixer.dist.src %>",  //대상 설정, 소스폴더
                dest: "<%= autoprefixer.dist.dest %>"  //결과파일 설정, 목적지폴더, 변환 및 생성
            }  //이런식으로 동적인 경로를 쓰는것도 가능하다.
        },

        cssmin: {  //CSS파일을 .min으로 압축하는 모듈
            options: {
                // compatibility: "ie8",
                keepSpecialComments: 1,
                // default - "!"가 붙은 주석은 보존,
                // 1 - "!"가 붙은 주석 중 첫번째 주석만 보존
                // 0 - 모든 주석 제거
                // noAdvanced: true,
            },
            dist: {  //적용되는 영역 (district)
                src: "dist/css/style.css",  //대상 설정, 이 폴더의 css파일을
                dest: "dist/css/style.min.css"  //결과파일 설정, 이 폴더의 .min.css파일로 변환 및 생성
            }
        },
        // end of CSS task


        //=======================================================================================================================================


        // JavaScript task
        jshint: {  //JavaScript의 오류를 검사하는 모듈
            //all: ["Gruntfile.js", "lib/**/*.js", "test/**/*.js"]  이렇게 한줄로 쓰는 방법도 존재함.
            options: {
                jshintrc: "gruntConfig/.jshintrc",  //옵션파일은 grunt폴더의 .jshintrc 파일에 JSON형식으로 기재되어있음.
                force: true,  //true일 경우, error 가 검출되어도 task를 fail 시키지 않고 계속 진행
                reporter: require("jshint-stylish")  //이 모듈의 output을 수정 할 수 있는 옵션 (사실 없어도 상관없음, 레포트 가독성상 추가함)
            },
            grunt: {  //Gruntfile.js의 위치를 작성하면 됨.
                src: ["Gruntfile.js"]
            },
            dist: {  //적용되는 영역 (district)(JavaScript의 오류를 검사할 파일들의 위치)
                expand: true,
                cwd: "workspace/js/site",  //대상 설정, 이 폴더의 .js파일을
                src: ["*.js"],       //대상 설정
                dest: "workspace/js/site"  //결과파일 설정, 이 폴더의 .js파일로 변환 및 생성
            }
        },

        concat: {  //파일을 병합하는 모듈 (하나만 로딩하면 페이지로딩속도가 더 빨라진다. 주로 JavaScript에 사용하지만, CSS도 병합할 수 있다.)
            options: {
                banner: "<%= banner %>"
            },
            dist: {  //적용되는 영역 (district)
                src: "workspace/js/site/*.js",  //대상 설정, 이 위치의 모든 .js파일을
                dest: "dist/js/site.js"  //결과파일 설정, 위 위치의 site.js파일로 병합.
                //JavaScript는 로딩되는 순서가 중요한데... 이 병합이 잘 해줄까 의문이 된다.
            }
        },

        uglify: {  //JavaScript를 .min.js 로 압축하는 모듈
            options: {
                banner: "<%= banner %>"
            },
            dist: {  //적용되는 영역 (district)
                src: "dist/js/site.js",  //대상 설정, 이 위치의 파일을
                dest: "dist/js/site.min.js"  //결과파일 설정, 이 파일로 변환 및 생성
            }
        },
        // end of JavaScript task


        //=======================================================================================================================================


        // others task
        imagemin: {  //이미지를 최적화해주는 모듈
            options: {
                title: "Build complete",  //성공 메시지로 보여줌
                message: "<%= pkg.name %> build finished successfully." //required
            },
            dist: {  //적용되는 영역 (district)
                files: [{
                    expand: true,
                    cwd: "workspace/images/",  //대상 설정, 이 폴더의
                    src: "**/*.{png,jpeg,jpg,gif}",  //대상 설정, 이 파일들을
                    dest: "dist/images/"  //결과파일 설정, 이 폴더로 변환 및 생성
                }]
            }
        },

        clean: {  //폴더와 파일을 삭제하는 모듈 (여러번 작업할 때, 파일을 덮어쓰지않고 삭제한후 다시 생산해서 사용함.)
            dist: {  //적용되는 영역 (district)
                files: [{
                    dot: true,
                    src: [  //대상 설정, 이 폴더들을 모두 삭제함.
                        "workspace/css",
                        "dist/**/*"
                    ]
                }]
            },
        },

        copy: {  //폴더나 파일을 복사하는 모듈 (제작된 .css나 .js를 복사하기도하고, font 같은것을 목적지 폴더에 복사하기도 합니다.)
            dist: {  //적용되는 영역 (district)
                files: [
                    {
                        expand: true,
                        cwd: "workspace/fonts/",  // fonts
                        src: "**",
                        dest: "dist/fonts/"
                    },
                    {
                        expand: true,
                        cwd: "workspace/js/lib",  // js/lib
                        src: ["*.js"],
                        dest: "dist/js/lib"
                    }
                ]
            }
        },



        // Grunt 최적화 task  (newer 라는 변경된 파일들만 빌드하도록 해주는 모듈도 있음, 다만 newer는 어떤 설정도 필요치 않음)
        concurrent: {  //병렬로 작업을 실행하게끔 해주는 모듈 (Grunt는 일반적으로 직렬로 작업을 처리함. 1번작업 끝 -> 2번작업 끝 -> 3번작업)
                       //이 모듈은, 관련성이 없는 작업을 동시에 실행하게끔 해준다. (coffee 와 Sass같은 느린작업을 동시에 실행하면 시간이 매우 빨라짐)
            options: {
                logConcurrentOutput: true
            },
            dist: [  //모듈명을 넣어도 되고, 작업명을 넣어도 된다. 이런 모듈또는 작업을 병렬로 동시에 실행한다는 뜻.
                "copy",
                "imagemin"
            ]
        },


        //=======================================================================================================================================


        // watch task  //변경된 파일을 감시하여 실시간으로 동기화하고, 로컬서버로 연결하여 브라우져로 확인할 수 있도록 도와주는 모듈
        watch: {  //파일을 감시해서, 변경사항 이있을 경우 실시간으로 Reload 하거나, 미리 정의된 작업을 실행하는 모듈
            options: {livereload: true},  //전역옵션 설정
            gruntfile: {
                files: ["Gruntfile.js"],       // files 속성 : 어떤 파일의 패턴을 정의. 문자열이나 파일의 배열, 또는 minimatch패턴 이 될수도 있음.
                tasks: ["newer:jshint:grunt"]  // tasks 속성 : 파일 감시 이벤트가 발생할 때 실행할 작업을 정의.
            },
            html: {                               //적용할 분류(카테고리?)
                files: ["workspace/docs/**/*.html"],    //적용할 파일
                tasks: ["htmlhint", "includes"]    //파일 변경이 이루어졌을 경우 실행할 작업, 모듈
            },
            less: {
                files: ["workspace/less/**/*.less"],
                tasks: ["less", "csslint", "autoprefixer", "csscomb", "concat"]
            },
            js: {
                files: ["workspace/js/**/*.js"],
                tasks: ["newer:jshint:dist", "concat", "uglify"],
                options: {
                  event: ["added", "deleted"],  //삽입, 삭제할 경우만...
                }
            },
            img: {
                files: ["workspace/images/**/*.{gif,jpeg,jpg,png}"],    //실질적으로 작업하는 모든 파일을 감시함.
                tasks: ["newer:imagemin"]
            },
        },
        connect: {  //서버를 이용해서 브라우져로 파일을 열수 있게끔 만들어주는 모듈 (콘솔창 : grunt connect)
            server: {
                options: {
                    protocol: "http",  //https도 가능
                    hostname: "localhost",
                    port: 9000,
                    livereload: 35729,
                    keepalive: true,  //서버가 계속 실행된 채로 유지하는 옵션. 이 작업 이후에 지정된 모든 작업은 실행되지 않음. (콘솔창이 멈춰있기 떄문임.)
                                      //default(false)로 놓을경우 Grunt작업이 완료되었을 때 웹서버를 정지한다.  grunt connect:targetname:keepalive 명령어로 ad-hoc을 가능하게함.
                    base: "dist",  //정적 파일을 제공할 루트 경로
                    open: "<%= connect.server.options.protocol %>://"
                         +"<%= connect.server.options.hostname %>:"
                         +"<%= connect.server.options.port %>/"
                         //+"category1/page-02.html"
                }
            }
        },

    });  //grunt.initConfig() 또는 grunt.config.init() 끝



    //=======================================================================================================================================



    // 디버깅하기 쉽고, 관리하기 쉽게 task(작업)별로 나누어서 task를 실행하고 관리하는 방법
    // server
    grunt.registerTask("serve", function (target) {  // (콘솔: grunt serve)
        if (target === "dist") {
            return grunt.task.run(["connect", "watch"]);
        }
        grunt.task.run(["default", "connect", "watch"]);
    });

    // html task
    grunt.registerTask("html", [  // (콘솔: grunt html) html을 만드는 작업은, 아래의 모듈이 한다. 이렇게 작업을 묶는것임.
            "htmlhint",
            "includes"
        ]
    );
    // css task
    grunt.registerTask("css", [  // (콘솔: grunt css)
            "less",
            "csslint",
            "autoprefixer",
            "csscomb",
            "cssmin"
        ]
    );

    // javascript task
    grunt.registerTask("js", [  // (콘솔: grunt js)
            "newer:jshint",
            "concat",
            "uglify"
        ]
    );

    // Grunt의 기본적인 작업 (모든 작업을 실행함)
    grunt.registerTask("default", [  // (콘솔: grunt) Grunt는 기본작업 명령을 default로 합니다. default명령은 생략이 가능합니다.
            "clean:dist",
            "html",
            "css",  //위의 작업뭉치 이름을 그냥 넣으면 됨.
            "js",
            "concurrent"
        ]
    );

    //원하는대로 마음대로 만들어서 사용.
    grunt.registerTask("build", [  // (콘솔: grunt build)
            "clean:dev",
            "concurrent",
            "copy"
        ]
    );
};
