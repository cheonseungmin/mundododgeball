// 필요한 모듈들을 가져옴
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 데이터베이스 연결 정보를 담고있는 변수
let connection
// mySQL과의 커넥션이 끊어졌을 때, 다시 커넥션을 시도하는 함수
const createConn = function () {
    // connection 변수에 데이터 베이스 연결을 위한 정보 재할당
    // 한번 연결했다가 실패한 connection은 재연결이 안되기 때문
    connection = mysql.createConnection({
        host: 'mundododgeball.cxhppsaqjlis.ap-northeast-2.rds.amazonaws.com',
        user: 'user',
        password: 'dpdltm137',
        database: 'mundododgeball'
    });

    // 커넥션 실행
    connection.connect(function (error) {
        console.log('connect')
        if (error) {
            // 에러가 생긴다면 출력한 뒤 2초 후에 다시 한번 실행 시도
            console.log(error)
            setTimeout(createConn, 2000);
        }
    });

    // 커넥션이 error를 감지하면 createConn 함수를 재발생시킴
    connection.on('error', function (error) {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            return createConn();
        }

        throw error;
    });
};

// db 연결 실행
createConn();

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

// 아이디 login을 담당하는 라우터
app.post('/login', function (req, res) {
    var query = 'insert into users(userId) values (?)';
    var params = [req.body.userId]
    var data = {}

    // 쿼리문, 인자를 실행시키고 그 결과값을 data에 저장하여 response 한다.
    connection.query(query, params, function (err) {
        if (err) {
            // userId가 기본키인데 중복된 아이디인 경우 error가 발생함을 알린다.
            data.state = 'duplicate'
            res.send(data)
        } else {
            // login이 됐음을 알린다.
            // 이후, 클라이언트 쪽을 통해서 소켓 연결이 시도 된다. 아래의 socket.on('login' 참고)
            data.state = 'login'
            data.userId = req.body.userId
            res.send(data)
        }
    })
});

// 접속중인 사용자 정보들을 알려주는 라우터
app.get('/userList', function (req, res) {
    // users 테이블에는 현재 접속 중인 사용자 정보만을 담고 있다.
    let query = 'select * from users'
    let data = {}
    connection.query(query, function (err, rows) {
        // select의 결과값은 배열 값으로 return 된다.
        data.users = rows
        res.send(data)
    })
});

// 사용자가 다른 사용자와 게임하기 위해 보낸 초대 메세지를 처리하는 라우터
app.post('/invite', function (req, res) {
    let query = 'select * from users where userId = ?'
    let params = [req.body.otherUserId]
    let data = {}
    connection.query(query, params, function (err, rows) {
        // 기본키인 userId를 통해 사용자의 속성 값들을 알 수 있다.
        data = rows[0] // 초대 상대
        // login 때 연결된 본인의 io소켓과 select로 알게 된 상대의 socket에게 연결을 시도한다.
        io.to(data.socketId).emit('invited', {
            userId: data.userId,
            socketId: data.socketId,
            otherUserId: req.body.userId, // 본인의 정보가 상대에게는 other 정보로 간다.
            otherSocketId: req.body.socketId
        })
    })
});


// login post 처리 후에 전송 된 소켓 연결 요청
io.on('connection', function (socket) {

    // userId 중복이 없음이 확인되고 소켓을 할당함
    socket.on('login', function (data) {
        let query = 'update users set socketId=?, state=? where userId=?'
        let params = [socket.id, 'login', data.userId]
        connection.query(query, params, function (err) {});

        // 소켓 연결이 성공했음을 알림
        io.to(socket.id).emit('login', {
            socketId: socket.id
        });
    })

    // invite 메세지 거절을 눌렀음을 알게 됨
    socket.on('reject', function (data) {
        io.to(data.otherSocketId).emit('reject', {
            otherUserId: data.userId // userId의 사용자가 거절했음을 알려주기 위함
        })
    })

    // invite 메세지를 승락함을 알게 됨
    socket.on('accept', function (data) {

        // 양 측의 사용자의 state가 gaming으로 바뀜
        let query = 'update users set state=? where userId=?'
        let params = ['gaming', data.userId]
        connection.query(query, params)

        query = 'update users set state=? where socketId=?'
        params = ['gaming', data.otherSocketId]
        connection.query(query, params)


        // 초대자에게 게임이 승락됨을 알림
        io.to(data.otherSocketId).emit('accept', {
            userId: data.otherUserId,
            socketId: data.otherSocketId,
            otherUserId: data.userId,
            otherSocketId: data.socketId
        })
    })


    // 스킬 키보드 눌렀다는 것을 전달함
    socket.on('keydown', function (data) {
        io.to(data.otherSocketId).emit('keydown', {
            key: data.key, // 스킬 사용을 위해 어떤 키를 눌렀는가 전송
            rad: data.rad // 스킬 발동 시에 마우스와 캐릭터의 각도를 전송
        })
    })

    // 마우스 왼쪽 클릭을 눌렀다는 것을 전달함
    socket.on('click', function (data) {
        io.to(data.otherSocketId).emit('click', {
            rad: data.rad // 캐릭터와 마우스의 각도를 전송
        })
    })

    // 마우스 오른쪽 클릭을 눌렀다는 것을 전달함
    socket.on('contextMenu', function (data) {
        io.to(data.otherSocketId).emit('contextMenu', {
            // 클릭된 좌표를 전송
            pageX: data.pageX,
            pageY: data.pageY
        })
    })

    // 캐릭터가 멈추기 위해 s, S 키보드를 눌렀음을 전달함
    socket.on('stop', function (data) {
        io.to(data.otherSocketId).emit('stop', {
            key: data.key
        })
    })

    // 체력이 떨어져 게임이 끝났음을 전달받음
    socket.on('end', function (data) {
        // 승자와 패자에게 다른 결과를 전송함으로써 다른 페이지가 렌더링 되게 함
        io.to(data.socketId).emit('end', {
            winner: data.winner
        })

        io.to(data.otherSocketId).emit('end', {
            winner: data.winner
        })
    })

    // 다시하기 버튼을 눌렀음을 전달받음
    socket.on('replay', function (data) {
        io.to(data.socketId).emit('replay', {
            replay: 'replay'
        })
        // 정해진 진행 순서를 위해 일단 소켓 연결을 disconnect 함
        socket.disconnect()
    })

    // 에러가 발생함을 전달받음
    socket.on('error', function (data) {
        io.to(data.otherSocketId).emit('error', {
            error: 'error'
        })
    })

    // 만약 사용자가 브라우저를 종료했을 때, users 테이블에서 정보를 삭제함
    app.post('/exit', function (req, res) {
        let query = 'delete from users where userId=?'
        let params = [req.body.userId]
        connection.query(query, params, function (err) {
            let data = {}
            res.send(data)
        })
        
        // 게임 중 이었다면, 상대방에게 본인이 창을 닫았음을 알림
        if (req.body.state == 'gaming') {
            io.to(req.body.otherSocketId).emit('error', {
                error: 'error'
            })
        }
    })
});

// 서버 실행
server.listen(3000, function () {
    console.log('서버가 시작되었습니다.');
});
