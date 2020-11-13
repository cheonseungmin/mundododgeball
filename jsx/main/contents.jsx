import React from 'react'
import ReactDOM from 'react-dom'
import Mundo from '../champion/mundo.jsx'

class Content extends React.Component {
	constructor(props) {
		super(props)
		this.myChampion = new Mundo(props, props.state.myColor, props.state.userId)
		this.otherChampion = new Mundo(props, props.state.otherColor, props.state.otherUserId)
		this.state = {
			init: 0,
			qFlag: false,
			qCooltime: 0,
			userId: props.state.userId,
			otherUserId: props.state.otherUserId,
			winner: null
		}
		
		this.audio = new Audio()
		this.audio.volume = 0.2
		this.audio.src = '../audio/game.mp3'
		this.audio.loop = 'true'
		this.audio.play()
		
		this.audioWin = new Audio()
		this.audioWin.volume = 0.2
		this.audioWin.src = '../audio/win.mp3'
		
		this.audioLose = new Audio()
		this.audioLose.volume = 0.2
		this.audioLose.src = '../audio/lose.mp3'
		
		this.handleContextMenu = this.handleContextMenu.bind(this)
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleClick = this.handleClick.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
		
		props.socket.on('contextMenu', function(data) {
			this.otherChampion.contextMenu(data, this)
		}.bind(this))
		
		props.socket.on('keydown', function(data) {
			if(data.key == 'q') {
				this.otherChampion.q(this, this.otherChampion, this.myChampion, data.rad)	
			}
		}.bind(this))
		
		props.socket.on('stop', function(data) {
			this.otherChampion.stop(this)
		}.bind(this))
		
		props.socket.on('click', function(data) {
			this.otherChampion.q(this, this.otherChampion, this.myChampion, data.rad)
		}.bind(this))
	}
	
	componentWillMount() {
	  window.addEventListener('keydown', this.handleKeyDown)
  	}
	
	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyDown)
  	}
	
	handleContextMenu(event) {
		event.preventDefault()
		this.props.socket.emit('contextMenu', {
			pageX: event.pageX,
			pageY: event.pageY,
			otherSocketId: this.props.state.otherSocketId
		})
		this.myChampion.contextMenu(event, this)
	}
	
	handleMouseMove(event) {
		this.myChampion.mouseMove(event, this)
	}
	
	handleClick(event) {
		if (!this.state.qFlag) {
			this.myChampion.click(this, this.myChampion, this.otherChampion, this.myChampion.state.rad)
			this.props.socket.emit('click', {
				rad: this.myChampion.state.rad,
				otherSocketId: this.props.state.otherSocketId
			})
		}
	}
	
	handleKeyDown(event) {
		this.myChampion.keydown(event, this, this.myChampion, this.otherChampion)
		if (this.state.qFlag) {
			this.props.socket.emit('keydown', {
				key: event.key,
				rad: this.myChampion.state.rad,
				otherSocketId: this.props.state.otherSocketId
			})
		}
		
		if((event.key == 's') || (event.key == 'S') || (event.key == 'ㄴ')) {
			this.props.socket.emit('stop', {
				key: event.key,
				otherSocketId: this.props.state.otherSocketId
			})
		}

	}
	
	render() {
		if(this.state.winner) {
			this.audio.pause()
			if(this.state.winner == this.state.userId) {
				this.audioWin.play()
			} else {
				console.log(this.state.winner)
				this.audioLose.play()
			}
			clearInterval(this.myChampion.moveIntervalIdx)
			clearInterval(this.myChampion.qIntervalIdx)
			clearInterval(this.myChampion.axeMoveIntervalIdx)
			clearInterval(this.otherChampion.moveIntervalIdx)
			clearInterval(this.otherChampion.qIntervalIdx)
			clearInterval(this.otherChampion.axeMoveIntervalIdx)
			
			this.props.socket.emit('end', {
				winner: this.state.winner,
				socketId: this.props.state.socketId,
				otherSocketId: this.props.state.otherSocketId
			})
			return <div>
				loading...
			</div>
		} else {
			let qCooltimeStyle = {
				position: 'absolute',
				width: '100px',
				height: '100px',
				left: 960,
				top: 540 + 300,
				zIndex: 0
			}

			let circleStyle = {
				position: 'absolute',
				width: '100px',
				height: '100px',
				left: 960,
				top: 540 + 300,
				borderRadius: '50%',
				background: 'conic-gradient(#ffffff ' + (25 * this.myChampion.state.qCooltime) + '%, #000000 0)',
				opacity: 0.1,
				zIndex: 1
			}
			let explainStyle = {
				position: 'absolute',
				left: 870,
				top: 540 + 400,
				fontSize: '1.5rem',
				border: '2px',
				color: 'white'
			}
			return <div onContextMenu={this.handleContextMenu} onMouseMove={this.handleMouseMove} onClick={this.handleClick}>
				<img src = "../../../img/map.png"/>
				{this.myChampion.render()}
				{this.otherChampion.render()}
				<img src="../img/mundo/qCooltime.png" style={qCooltimeStyle}/>
				<div style={circleStyle}></div>
				<div style={explainStyle}>Q를 눌러 공격하세요!</div>
			</div>
		}
	}
}

export default Content