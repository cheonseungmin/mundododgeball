// 필요한 모듈들을 가져옴
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const server = require('http').createServer(app);
const io = require('socket.io')(server);


let connection
// mySQL과의 커넥션이 끊어졌을 때, 다시 커넥션을 시도하는 함수
const createConn = function () {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'dpdltm137',
        database: 'mundoDodgeBall'
    });

    connection.connect(function (error) {
        console.log('connect')
        if (error) {
            console.log(error)
            setTimeout(createConn, 2000);
        }
    });

    connection.on('error', function (error) {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            return createConn();
        }

        throw error;
    });
};

createConn();

// mundoDodgeBall 폴더
app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());


app.get('/', function (req, res) {
    console.log('new user!' + (new Date()))
    res.redirect('./public/index.html')
});

app.post('/login', function (req, res) {
    var query = 'insert into users(userId) values (?)';
    var params = [req.body.userId]
    var data = {}

    connection.query(query, params, function (err) {
        if (err) {
            data.state = 'duplicate'
            res.send(data)
        } else {
            data.state = 'login'
            data.userId = req.body.userId
            res.send(data)
        }
    })
});

app.get('/userList', function (req, res) {
    let query = 'select * from users'
    let data = {}
    connection.query(query, function (err, rows) {
        data.users = rows
        res.send(data)
    })
});

app.post('/invite', function (req, res) {
    let query = 'select * from users where userId = ?'
    let params = [req.body.otherUserId]
    let data = {}
    connection.query(query, params, function (err, rows) {
        data = rows[0] // other
        io.to(data.socketId).emit('invited', {
            userId: data.userId,
            socketId: data.socketId,
            otherUserId: req.body.userId,
            otherSocketId: req.body.socketId
        })
    })
});


io.on('connection', function (socket) {
    socket.on('login', function (data) {
        let query = 'update users set socketId=?, state=? where userId=?'
        let params = [socket.id, 'login', data.userId]
        connection.query(query, params, function (err) {

        })
        io.to(socket.id).emit('login', {
            socketId: socket.id
        })
    })

    socket.on('reject', function (data) {
        io.to(data.otherSocketId).emit('reject', {
            otherUserId: data.userId
        })
    })

    socket.on('accept', function (data) {
        let query = 'update users set state=? where userId=?'
        let params = ['gaming', data.userId]
        connection.query(query, params)

        query = 'update users set state=? where socketId=?'
        params = ['gaming', data.otherSocketId]
        connection.query(query, params)


        io.to(data.otherSocketId).emit('accept', {
            userId: data.otherUserId,
            socketId: data.otherSocketId,
            otherUserId: data.userId,
            otherSocketId: data.socketId
        })
    })

    socket.on('keydown', function (data) {
        io.to(data.otherSocketId).emit('keydown', {
            key: data.key,
            rad: data.rad
        })
    })

    socket.on('click', function (data) {
        io.to(data.otherSocketId).emit('click', {
            rad: data.rad
        })
    })

    socket.on('contextMenu', function (data) {
        io.to(data.otherSocketId).emit('contextMenu', {
            pageX: data.pageX,
            pageY: data.pageY
        })
    })

    socket.on('stop', function (data) {
        io.to(data.otherSocketId).emit('stop', {
            key: data.key
        })
    })

    socket.on('end', function (data) {
        io.to(data.socketId).emit('end', {
            winner: data.winner
        })

        io.to(data.otherSocketId).emit('end', {
            winner: data.winner
        })
    })

    socket.on('replay', function (data) {
        io.to(data.socketId).emit('replay', {
            replay: 'replay'
        })
        socket.disconnect()
    })

    socket.on('error', function (data) {
        io.to(data.otherSocketId).emit('error', {
            error: 'error'
        })
    })

    app.post('/exit', function (req, res) {
        let query = 'delete from users where userId=?'
        let params = [req.body.userId]
        connection.query(query, params, function (err) {
            let data = {}
            res.send(data)
        })
        if (req.body.state == 'gaming') {
            io.to(req.body.otherSocketId).emit('error', {
                error: 'error'
            })
        }
    })
})

server.listen(3000, function () {
    console.log('서버가 시작되었습니다.');
});
