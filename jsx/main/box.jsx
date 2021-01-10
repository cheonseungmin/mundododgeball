import React from 'react'
import ReactDOM from 'react-dom'
import Contents from './contents.jsx'
import UserList from './userList.jsx'

// 게임에 대한 직접적인 내용을 담고 있는 컴포넌트
class Box extends React.Component {
	constructor(props) {
		super(props)
		this.main = props.main // main의 함수와 상태를 이용하기 위함
	}
	
	render() {
        // 게임 로고를 위한 스타일
		const logo = {
			position: 'absolute', 		 
			display:'inlineBlock', 
			left: '450px', 
			top: '130px',
		}
        
        
		const box = { // 로그인 창, 유저 목록, 상태 창을 위한 스타일
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
        
        
        if(this.main.state.state == 'logout') { // main 컴포넌트의 상태에 따른 컴포넌트 라우팅
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
                        { /* 만약 초대가 온다면 state가 바뀌며 재렌더링이 되는데, 이 때 상대 아이디의 유무를 통해 초대 창을 렌더링 한다. */ }
						{(
							()=>{
								if(this.main.state.otherUserId) { // 상대의 아이디가 존재 => 초대 이벤트 때문
									let audioMessage = new Audio() // 메세지 도착 알림 재생
									audioMessage.src = '../audio/message.mp3'
									audioMessage.play()
                        
									return <div style={{fontSize: '0.8rem', color: 'skyblue', padding: '5px 5px 5px 0px'}}> { /* 초대 창 렌더링  */ }
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
                        
						<UserList state={this.main.state}/> { /* 접속 중인 사용자들을 알기 위한 userList 컴포넌트 렌더링 */ }
					</div>
				</div>
			)
		} else if(this.main.state.state == 'duplicate') { // 아이디 로그인을 했지만 중복된 아이디를 입력한 경우
            
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
		}	else if(this.main.state.state == 'gaming') { // 초대를 승락하여 게임이 시작된 경우, Contents 컴포넌트를 렌더링한다.
            
			this.main.audio.pause()
				return (
					<div>
						<Contents socket={this.main.socket} state={this.main.state}/>
					</div>
				)
		} else if(this.main.state.state == 'end') { // 게임이 끝난 경우, 10초 뒤에 자동 로그아웃이 되게 한다.
            
			(
				()=>{
					this.main.state.endTimeout = setTimeout(function() {
						window.location.href = 'http://121.147.5.20:3000' // 서버의 주소
					}, 2000)
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
						2초 후에 메인화면으로 돌아갑니다..
					</div>
				</div>
			</div>
		}
	}
    
}
export default Box