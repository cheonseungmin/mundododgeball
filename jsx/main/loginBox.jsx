import React from 'react'
import ReactDOM from 'react-dom'
import UserList from './userList.jsx'

// 게임에 대한 직접적인 내용을 담고 있는 컴포넌트
class LoginBox extends React.Component {
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
        
        return (
            <div>
                <img src="https://dudghsx.s3.ap-northeast-2.amazonaws.com/img/LOGO.png" style={logo}></img>
                <img src="https://dudghsx.s3.ap-northeast-2.amazonaws.com/img/main.png" style={{width: '100%', height: '100%'}}></img>
                <div style={box}>
                    <div>
                        {this.main.state.userId}님<br/>반갑습니다.
                    </div>
                    { /* 만약 초대가 온다면 state가 바뀌며 재렌더링이 되는데, 이 때 상대 아이디의 유무를 통해 초대 창을 렌더링 한다. */ }
                    {(
                        ()=>{
                            if(this.main.state.otherUserId) { // 상대의 아이디가 존재 => 초대 이벤트 때문
                                let audioMessage = new Audio() // 메세지 도착 알림 재생
                                audioMessage.src = 'https://dudghsx.s3.ap-northeast-2.amazonaws.com/audio/message.mp3'
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
		
	}
    
}
export default LoginBox