// 필요한 모듈들을 가져옴
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//app.use를 미들웨어를 거치게 된다.

// mundoDodgeBall 폴더의 파일들을 static으로 가져온다
app.use(express.static(__dirname));

// post request를 bodyParser를 사용하면 req.body로 접근 할 수 있게 된다.
// application/x-www-form-urlencoded의 경우
app.use(bodyParser.urlencoded({
    extended: false
}));
// json의 경우
app.use(bodyParser.json());


// 사용자 접속 시에 static으로 생성된 파일 경로로 redirect해준다.
app.get('/', function (req, res) {
    console.log('new user!' + (new Date()))
    res.redirect('./public/index.html')
});

// 서버 실행
server.listen(3000, function () {
    console.log('서버가 시작되었습니다.');
});
