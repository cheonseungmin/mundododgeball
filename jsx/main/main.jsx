import React from 'react'
import axios from 'axios'
import socketIo from 'socket.io-client'
import Box from './box.jsx'


class Main extends React.Component {
	constructor(props) {
		super(props)
		this.socket = null
		this.state = {
			state: 'logout',
			userId: null,
			socketId: null,
			otherUserId: null,
			otherSocketId: null,
			myColor: null,
			otherColor: null,
			winner: null,
			endTimeout: null
		}
		window.addEventListener('beforeunload', function() {
			if(this.state.userId) {
					axios.post('/exit', {
						userId: this.state.userId,
						state: this.state.state,
						otherUserId: this.state.otherUserId,
						otherSocketId: this.state.otherSocketId
				})
			}
		}.bind(this))
		
		this.audio = new Audio()
		this.audio.volume = 0.2
		this.audio.src = '../audio/main.mp3'
		this.audio.loop = 'true'
		
		this.login = this.login.bind(this)
		this.accept = this.accept.bind(this)
		this.reject = this.reject.bind(this)
		this.inputId = this.inputId.bind(this)
		this.replay = this.replay.bind(this)
	}
	
	login() {
		this.audio.pause()
		this.audio.play()
		axios.post('/login', {
			userId: ((this.state.userId)? (this.state.userId) : (document.querySelector('#userId').value))
		}).then(function(res) {
			this.setState({
				state: res.data.state,
				userId: res.data.userId
			})
			if(this.state.state == 'login') {
				 this.socket = socketIo.connect('http://168.131.145.185:3000') //학교
				
				this.socket.emit('login', {
					userId: this.state.userId
				})
				
				this.socket.on('login', function(data) {
					this.setState({
						socketId: data.socketId
					})
				}.bind(this))
				
				this.socket.on('invited', function(data) {
					this.setState({
						otherUserId: data.otherUserId,
						otherSocketId: data.otherSocketId
					})
				}.bind(this))
				
				this.socket.on('reject', function(data) {
					alert('' + data.otherUserId + '님이 초대를 거절하셨습니다.')
				})
				
				this.socket.on('accept', function(data) {
					this.setState({
						state: 'gaming',
						myColor: 'red',
						otherColor: 'blue',
						otherUserId: data.otherUserId,
						otherSocketId: data.otherSocketId
					})
				}.bind(this))
				
				this.socket.on('end', function(data) {
					this.setState({
						state: 'end',
						winner: data.winner
					})
				}.bind(this))
				
				this.socket.on('error', function(data) {
					alert('상대방과의 연결이 끊어졌습니다!')
					window.location.href = 'http://168.131.145.185:3000'
				}.bind(this))
				
				this.socket.on('replay', function(data) {
					axios.post('/exit', {
						userId: this.state.userId
					}).then(function(data) {
						this.setState({
							login: 'login',
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
	
	accept() {
		this.socket.emit('accept', {
			userId: this.state.userId,
			socketId: this.state.socketId,
			otherUserId: this.state.otherUserId,
			otherSocketId: this.state.otherSocketId
		})
		
		this.setState({
			state: 'gaming',
			myColor: 'blue',
			otherColor: 'red'
		})
	}
	
	reject() {
		this.socket.emit('reject', {
			userId: this.state.userId,
			otherSocketId: this.state.otherSocketId 
		})
		this.setState({
			otherUserId: null,
			otherSocketId: null
		})
	}
	
	inputId(event) {
		if((event.target.value == "1회용 닉네임을 입력하세요.") || (event.target.value == "중복된 닉네임입니다.")) event.target.value = " "
	}
	
	replay() {
		clearTimeout(this.state.endTimeout)
		this.socket.emit('replay', {
			socketId: this.state.socketId
		})
	}
	
	render() {
		return <Box main={this} />
	}
}
export default Main