import React from 'react'
import axios from 'axios'
import socketIo from 'socket.io-client'
import Box from './box.jsx'

// SPA의 틀이 되는 컴포넌트
class Main extends React.Component {
    
    constructor(props) {
        super(props)
        this.socket = null // 로그인 후에 서버와 연결될 소켓
        this.state = {
            state: 'logout', // 현재 사용자의 상태
            userId: null, // 사용자가 로그인 할 아이디
            socketId: null, // 서버로부터 전송받은 소켓 아이디
            otherUserId: null, // 상대와 매칭된 후에 전송받을 상대의 아이디
            otherSocketId: null, // 상대와 매칭된 후에 전송받을 상대의 소켓 아이디
            myColor: null, // 게임 초대한 사용자가 red, 승락한 사용자가 blue로 초기화 됨
            otherColor: null, // 상대방의 색깔, 캐릭터 구분을 위함
            winner: null, // 게임이 끝난 뒤 승자의 아이디
            endTimeout: null // 게임이 끝난 뒤 10초 뒤에 자동으로 로그아웃 하기위한 timeout 변수
        }
        window.addEventListener('beforeunload', function () {
            // 사용자가 브라우저를 종료했을 때, 서버에 요청하여 users 테이블에서 정보를 삭제하고, 상대방에게는 게임이 강제 종료되었음을 알리기 위함
            if (this.state.userId) {
                axios.post('/exit', {
                    userId: this.state.userId,
                    state: this.state.state,
                    otherUserId: this.state.otherUserId,
                    otherSocketId: this.state.otherSocketId
                })
            }
        }.bind(this))

        // 게임 배경음악 재생을 위한 부분
        this.audio = new Audio()
        this.audio.volume = 0.2
        this.audio.src = '../audio/main.mp3'
        this.audio.loop = 'true'

        // 함수들을 컴포넌트와 바인딩하는 과정
        this.login = this.login.bind(this)
        this.accept = this.accept.bind(this)
        this.reject = this.reject.bind(this)
        this.inputId = this.inputId.bind(this)
        this.replay = this.replay.bind(this)
    }

    // 로그인 버튼을 눌렀을 때 실행되는 함수
    login() {
        this.audio.pause() // 다시하기 버튼을 눌렀을 때, 게임 상태와 로그인 상태의 음악이 다르기 때문에 일단 정지를 한 뒤에 재시작한다.
        this.audio.play()
        axios.post('/login', {
            // 다시하기 버튼인 경우, this.state.userId가 그대로 유지됨으로 놔두고, 처음 로그인하는 경우에는 정보를 추출하여 userId에 저장한다.
            userId: ((this.state.userId) ? (this.state.userId) : (document.querySelector('#userId').value))
        }).then(function (res) {
            // 서버로부터 요청 결과(상태)를 받는다.
            this.setState({
                state: res.data.state,
                userId: res.data.userId
            })

            // state에 따라서 라우팅함
            if (this.state.state == 'login') {
                // login의 경우, 서버로부터 socket을 할당받기 위한 요청을 한다.
                this.socket = socketIo.connect('http://localhost:3000') //서버의 주소, 제 경우에는 집에서 포트 포워딩을 통해 서버를 열었습니다.


                // 밑으로는 연결된 소켓이 요청의 라우팅 과정입니다.
                // emit: 이벤트 전송, on: 이벤트가 왔을 때

                // 소켓에 socketId를 할당받기 위한 요청을 합니다.
                this.socket.emit('login', {
                    userId: this.state.userId
                })

                // 할당받은 socketId를 state에 저장합니다.
                this.socket.on('login', function (data) {
                    this.setState({
                        socketId: data.socketId
                    })
                }.bind(this))


                // 초대 받았을 때 상대방을 other으로 저장합니다.
                // 초대 신청 함수는 userList.jsx 컴포넌트에 있습니다.
                this.socket.on('invited', function (data) {
                    this.setState({
                        otherUserId: data.otherUserId,
                        otherSocketId: data.otherSocketId
                    })
                }.bind(this))


                // 상대방이 초대를 거절했음을 알립니다.
                this.socket.on('reject', function (data) {
                    alert('' + data.otherUserId + '님이 초대를 거절하셨습니다.')
                })


                // 상대방이 초대를 승락했을 때, 본인을 red, 상대방을 blue로 설정합니다.
                this.socket.on('accept', function (data) {
                    this.setState({
                        state: 'gaming',
                        myColor: 'red',
                        otherColor: 'blue',
                        otherUserId: data.otherUserId,
                        otherSocketId: data.otherSocketId
                    })
                }.bind(this))

                // 게임이 끝났음을 알립니다.
                this.socket.on('end', function (data) {
                    this.setState({
                        state: 'end',
                        winner: data.winner
                    })
                }.bind(this))

                // 상대방이 브라우저를 강제 종료했음을 알립니다.
                this.socket.on('error', function (data) {
                    alert('상대방과의 연결이 끊어졌습니다!')
                    window.location.href = 'http://localhost:3000'
                    // 서버로 재접속을 시도합니다.
                }.bind(this))

                // 다시하기 버튼을 눌렀음을 알립니다.
                // 먼저 exit 처리를 한 뒤, userId를 그대로 두고 login 상태로 바꿉니다.
                this.socket.on('replay', function (data) {
                    axios.post('/exit', {
                        userId: this.state.userId
                    }).then(function (data) {
                        this.setState({
                            state: 'login',
                            socketId: null,
                            otherUserId: null,
                            otherSocketId: null
                        })
                        this.login()
                    }.bind(this))
                }.bind(this))
            }
        }.bind(this))
    }

    // 초대가 왔을 때, 수락 버튼을 누르면 실행되는 함수 입니다.
    accept() {
        this.socket.emit('accept', {
            userId: this.state.userId,
            socketId: this.state.socketId,
            otherUserId: this.state.otherUserId,
            otherSocketId: this.state.otherSocketId
        })

        // 본인은 blue가 되고, 상대는 red가 됩니다.
        this.setState({
            state: 'gaming',
            myColor: 'blue',
            otherColor: 'red'
        })
    }

    // 거절 버튼을 누르면 실행되는 함수 입니다.
    reject() {
        this.socket.emit('reject', {
            userId: this.state.userId,
            otherSocketId: this.state.otherSocketId
        })
        // 상대에 대한 정보를 없앱니다.
        this.setState({
            otherUserId: null,
            otherSocketId: null
        })
    }

    // 아이디 입력을 위해 input 클릭을 하면 해당 내용이 지워집니다.
    inputId(event) {
        if ((event.target.value == "1회용 닉네임을 입력하세요.") || (event.target.value == "중복된 닉네임입니다.")) event.target.value = " "
    }

    // 다시하기 버튼을 눌렀을 때 실행되는 함수 입니다.
    replay() {
        clearTimeout(this.state.endTimeout)
        this.socket.emit('replay', {
            socketId: this.state.socketId
        })
    }

    // main 컴포넌트의 state에 따라 게임 렌더링이 달라지기 때문에, box 컴포넌트를 만들어 라우팅하였습니다. 굳이 main과 box를 따로 만든 이유는, box 컴포넌트 안에 게임 대기 중인 상태와 게임 플레이 중인 상태를 쉽게 나누기 위함입니다.
    render() {
		return <Box main={this} />
	}
}
export default Main
