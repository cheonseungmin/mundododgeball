import React from'react'
import ReactDOM from'react-dom'

class Mundo extends React.Component {
	constructor(props, color, userId) {
		super(props)
		this.state = {
			color: color,
			img: "../img/mundo/mundoFront.png",
			widthHalf: 130,
			heightHalf: 70,
			x: ((color == 'red') ? (800) : (1250)),
			y: ((color == 'red') ? (400) : (750)),
			moveIntervalIdx: null,
			direction: 'Front',
			rad: 0,
			degree: null,
			qFlag: false,
			qRangeVisibility: 'hidden',
			axeX: ((color == 'red') ? (800) : (1250)),
			axeY: ((color == 'red') ? (400) : (750)),
			axeVisibility: 'hidden',
			qCooltime: 0,
			qIntervalIdx: null,
			axeMoveIntervalIdx: null,
			userId: userId,
			health: 150,
			damage: 30,
		}
		this.audioCooltime = new Audio(),
		this.audioQ = new Audio()
		this.audioCooltime.volume = 0.2
		this.audioCooltime.src = '../audio/mundo.mp3'
		this.audioQ.volume = 0.2
	}

	contextMenu(event, contents) {
		clearInterval(this.state.moveIntervalIdx)
		let pageX = event.pageX
		let pageY = event.pageY
		this.state.rad = Math.atan2(this.state.y - pageY, this.state.x - pageX)
		this.state.degree = (this.state.rad * 180) / Math.PI

		/* mundo image */
		if ((-45 <= this.state.degree) && (this.state.degree < 45)) {
			this.state.direction = "Left"
			this.state.img = "../img/mundo/mundoLeft.gif"
			this.state.widthHalf = 70
			this.state.heightHalf = 115
		} else if ((45 <= this.state.degree) && (this.state.degree < 135)) {
			this.state.direction = "Back"
			this.state.img = "../img/mundo/mundoBack.gif"
			this.state.widthHalf = 130
			this.state.heightHalf = 70
		} else if ((-135 <= this.state.degree) && (this.state.degree < -45)) {
			this.state.direction = "Front"
			this.state.img = "../img/mundo/mundoFront.gif"
			this.state.widthHalf = 130
			this.state.heightHalf = 70
		} else {
			this.state.direction = "Right"
			this.state.img = "../img/mundo/mundoRight.gif"
			this.state.widthHalf = 60
			this.state.heightHalf = 115
		}



		/* mundo move */
		let distance = Math.sqrt(Math.pow((pageX - this.state.x), 2) + Math.pow((pageY - this.state.y), 2))
		if (distance == 0) return null

		let step = 10
		let stepX = ((pageX - this.state.x) * step) / distance
		let stepY = ((pageY - this.state.y) * step) / distance
		this.state.moveIntervalIdx = setInterval(function () {
			let flagX = false
			let flagY = false
			if (Math.abs(pageX - this.state.x) < Math.abs(stepX)) {
				stepX = pageX - this.state.x
				flagX = true
			}
			if (Math.abs(pageY - this.state.y) < Math.abs(stepY)) {
				stepY = pageY - this.state.y
				flagY = true
			}

			let testX = this.state.x + stepX
			let testY = this.state.y + stepY


			let x11 = 640 + 50
			let y11 = 0 + 340 - 30

			let x5 = 1360 + 30
			let y5 = 0 + 920 - 50

			let midX = 960
			let midY = 540

			if (this.state.color == 'red') {
				if (testX >= midX) {
					flagX = true
					flagY = true
				}
			} else {
				if (testX <= midX) {
					flagX = true
					flagY = true
				}
			}

			if (((testX < x11) || (x5 < testX)) || ((testY < y11) || (y5 < testY))) {
				flagX = true
				flagY = true
			}

			if (flagX && flagY) {
				this.state.img = "../img/mundo/mundo" + this.state.direction + ".png"
				clearInterval(this.state.moveIntervalIdx)
				contents.setState({
					init: 0
				})
			} else {
				this.state.x = testX
				this.state.y = testY
				contents.setState({
					init: 0
				})
			}
		}.bind(this), 30)
	}

	mouseMove(event, contents) {
		let pageX = event.pageX
		let pageY = event.pageY
		this.state.rad = Math.atan2(this.state.y - pageY, this.state.x - pageX)
		this.state.degree = (this.state.rad * 180) / Math.PI
		contents.setState({
			init: (contents.state.init == 0) ? 1 : 0
		})
	}

	keydown(event, contents, myChampion, otherChampion) {
		if (event.key == 'q' || event.key == 'Q' || event.key == 'ㅂ') {
			if (this.state.qFlag) {
				this.q(contents, myChampion, otherChampion, myChampion.state.rad)
				this.state.qFlag = false
				this.state.qRangeVisibility = 'hidden'
				contents.setState({
					init: 0,
					qFlag: true
				})
			} else {
				this.state.qFlag = true
				this.state.qRangeVisibility = 'visible'
				contents.setState({
					init: 0,
					qFlag: false
				})
			}
		} else if (event.key == 's' || event.key == 'S' || event.key == 'ㄴ') {
			this.stop(contents)
		}
	}

	q(contents, champion1, champion2, rad) {
		if (champion1.state.qCooltime != 0) return null
		this.audioQ.src = '../audio/attack.mp3'
		this.audioQ.play()
		champion1.state.axeX = champion1.state.x
		champion1.state.axeY = champion1.state.y

		/* cooltime reset */
		champion1.state.qCooltime = 3
		champion1.state.qIntervalIdx = setInterval(function () {
			champion1.state.qCooltime = champion1.state.qCooltime - 1
			if (this.state.qCooltime == 0) {
				this.audioCooltime.play()
				clearInterval(champion1.state.qIntervalIdx)
			}
			contents.setState({
				init: 0,
				qCooltime: contents.myChampion.state.qCooltime
			})
		}.bind(this), 1000)

		champion1.state.axeVisibility = 'visible'

		/* throwing axe */
		let targetX = champion1.state.x - (Math.cos(rad) * 400)
		let targetY = champion1.state.y - (Math.sin(rad) * 400)
		let step = 10
		let stepX = (((targetX - champion1.state.x) * step) / 400)
		let stepY = (((targetY - champion1.state.y) * step) / 400)

		champion1.state.axeMoveIntervalIdx = setInterval(function () {
			let flagX = false
			let flagY = false
			if (Math.abs(targetX - champion1.state.axeX) <= Math.abs(stepX)) {
				stepX = targetX - champion1.state.axeX
				flagX = true
			}
			if (Math.abs(targetY - champion1.state.axeY) <= Math.abs(stepY)) {
				stepY = targetY - champion1.state.axeY
				flagY = true
			}

			if ((champion2.state.x - champion2.state.widthHalf <= champion1.state.axeX) && (champion1.state.axeX <= champion2.state.x + champion2.state.widthHalf)) {
				if ((champion2.state.y - champion2.state.heightHalf <= champion1.state.axeY) && (champion1.state.axeY <= champion2.state.y + champion2.state.heightHalf)) {
					this.audioQ.src = '../audio/damage.mp3'
					this.audioQ.play()
					flagX = true
					flagY = true
					champion2.state.health = champion2.state.health - champion1.state.damage
				}
			}

			champion1.state.axeX = champion1.state.axeX + stepX
			champion1.state.axeY = champion1.state.axeY + stepY

			if (flagX && flagY) {
				champion1.state.axeX = champion1.state.x
				champion1.state.axeY = champion1.state.y
				champion1.state.axeVisibility = 'hidden'
				contents.setState({
					init: 0
				})
				if(champion2.state.health == 0) {
					clearInterval(champion1.state.qIntervalIdx)
					contents.setState({
						winner: champion1.state.userId
					})
				}
				clearInterval(champion1.state.axeMoveIntervalIdx)
			}
			contents.setState({
				init: 0
			})
		}.bind(this), 20)
		champion1.state.qFlag = false
	}

	stop(contents) {
		this.state.img = "../img/mundo/mundo" + this.state.direction + ".png"
		clearInterval(this.state.moveIntervalIdx)
		this.state.qFlag = false
		this.state.qRangeVisibility = 'hidden'
		contents.setState({
			init: 0
		})
	}
	
	click(contents, myChampion, otherChampion, rad) {
		myChampion.q(contents, myChampion, otherChampion, rad)
		myChampion.state.qFlag = false
		myChampion.state.qRangeVisibility = 'hidden'
		contents.setState({
			qFlag: true
		})
	}
	

	render() {
		let mundoStyle = {
			position: 'absolute',
			display: 'inlineBlock',
			width: '' + (this.state.widthHalf * 2) + 'px',
			height: '' + (this.state.heightHalf * 2) + 'px',
			left: '' + (this.state.x - this.state.widthHalf) + 'px',
			top: '' + (this.state.y - this.state.heightHalf) + 'px'
		}

		let qRangeStyle = {
			visibility: this.state.qRangeVisibility,
			position: 'absolute',
			width: '800px',
			height: '60px',
			left: this.state.x - 400,
			top: this.state.y - 30,
			transform: 'rotate(' + this.state.degree + 'deg)',
		}

		let axeStyle = {
			width: '100px',
			height: '100px',
			visibility: this.state.axeVisibility,
			position: 'absolute',
			left: this.state.axeX - 50,
			top: this.state.axeY - 50
		}
		
		let userIdStyle = {
			position: 'absolute',
			left: this.state.x - 120,
			top: this.state.y - 190,
			color: 'white'
		}
		
		let healthStyle = {
			position: 'absolute',
			display: 'inlineBlock',
			background: this.state.color,
			width: '' + this.state.health + 'px',
			height: '25px',
			left: this.state.x - 120,
			top: this.state.y - 160,
		}

		return <div>
				<div style={userIdStyle}>{this.state.userId}</div>
				<div style={healthStyle}></div>
				<img src = {this.state.img} style = {mundoStyle}/>
				<img src="../img/mundo/mundoQRange.png" style={qRangeStyle}/>
				<img src="../img/mundo/mundoAxe.gif" style={axeStyle}/>
			</div>
	}
}

export default Mundo
