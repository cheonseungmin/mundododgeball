import React from 'react'
import ReactDOM from 'react-dom'
import Contents from './contents.jsx'
import UserList from './userList.jsx'

class Box extends React.Component {
	constructor(props) {
		super(props)
		this.main = props.main
		console.log(this.main)
	}
	
	render() {
		const logo = {
			position: 'absolute', 		 
			display:'inlineBlock', 
			left: '450px', 
			top: '130px',
		}
		const box = {
			position: 'absolute', 		 
			display:'inlineBlock', 
			left: '450px', 
			top: '330px',
			border: '1.5px solid gold',
			backgroundColor: '#010a13',
			color: 'white',
			padding: '15px',
			width: '400px',
			fontSize: '1.3rem',
			opacity: 0.8,
		}
		if(this.main.state.state == 'logout') {
			return (
				<div>
					<img src="../../img/logo.png" style={logo}></img>
					<img src="../../img/main.png" style={{width: '100%', height: '100%'}}></img>
					<div style={box}>
						<div style={{fontSize: '1.3rem'}}>
							로그인
						</div>
						<hr/><br/>
						<input type="text" id="userId" onClick={this.main.inputId} defaultValue="1회용 닉네임을 입력하세요." style={{width: '250px'}}></input>&nbsp;
						<button onClick={this.main.login}>중복 검색</button><br/>
					</div>
				</div>
			)	
		} else if(this.main.state.state == 'login') {
			return (
				<div>
					<img src="../../img/logo.png" style={logo}></img>
					<img src="../../img/main.png" style={{width: '100%', height: '100%'}}></img>
					<div style={box}>
						<div>
							{this.main.state.userId}님<br/>반갑습니다.
						</div>
						{(
							()=>{
								if(this.main.state.otherUserId) {
									let audioMessage = new Audio()
									audioMessage.src = '../audio/message.mp3'
									audioMessage.play()
									return <div style={{fontSize: '0.8rem', color: 'skyblue', padding: '5px 5px 5px 0px'}}>
												<button onClick={this.main.accept}>수락</button>
												<button onClick={this.main.reject}>거절</button>&nbsp;
												{this.main.state.otherUserId}님께서 게임에 초대하셨습니다!
										</div>
								}
							}
						)()}
						<hr/>
						<div style={{fontSize: '0.9rem', color: 'red'}}>
							초대를 한 사용자의 색이 red입니다.
						</div>
						<UserList state={this.main.state}/>
					</div>
				</div>
			)
		} else if(this.main.state.state == 'duplicate') {
			return (
				<div>
					<img src="../../img/logo.png" style={logo}></img>
					<img src="../../../img/main.png" style={{width: '100%', height: '100%'}}></img>
					<div style={box}>
						<div style={{fontSize: '1.5rem'}}>
							로그인
						</div>
						<hr/><br/>
						<input type="text" id="userId" style={{width: '250px'}}></input>&nbsp;
						<button onClick={this.main.login}>중복 검색</button><br/>
						<div style={{color: 'red', fontSize: '0.7rem'}}>
							중복된 아이디 입니다. 
						</div>
					</div>
				</div>
			)
		}	else if(this.main.state.state == 'gaming') {
			this.main.audio.pause()
				return (
					<div>
						<Contents socket={this.main.socket} state={this.main.state}/>
					</div>
				)
		} else if(this.main.state.state == 'end') {
			(
				()=>{
					this.main.state.endTimeout = setTimeout(function() {
						window.location.href = 'http://168.131.145.185:3000'
					}, 10000)
				}
			)()
			return <div>
				<img src="../../img/logo.png" style={logo}></img>
				<img src="../../../img/main.png" style={{width: '100%', height: '100%'}}></img>
				<div style={box}>
					<div style={{fontSize: '1.5rem'}}>
						winner is {this.main.state.winner} !
					</div>
					<hr/>
					<div style={{fontSize: '0.8rem'}}>
						10초 후에 메인화면으로 돌아갑니다..
					</div>
					<button onClick={this.main.replay}>다시하기</button>
				</div>
			</div>
		}
	}
}

export default Box