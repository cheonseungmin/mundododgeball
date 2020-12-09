import React from 'react'
import ReactDOM from 'react-dom'

// 게임에 대한 직접적인 내용을 담고 있는 컴포넌트
class EndBox extends React.Component {
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
		};
        
         // 게임이 끝난 경우, 10초 뒤에 자동 로그아웃이 되게 한다.
        (
            ()=>{
                this.main.state.endTimeout = setTimeout(function() {
                    window.location.href = 'http://localhost:3000' // 서버의 주소
                }, 3000)
            }
        )()
        
        
        return <div>
            <img src="../../img/logo.png" style={logo}></img>
            <img src="../../../img/main.png" style={{width: '100%', height: '100%'}}></img>
            <div style={box}>
                <div style={{fontSize: '1.5rem'}}>

                    { (() =>  {
                        if(this.main.state.winner === this.main.state.userId) {
                            return 'You win!'
                        } else {
                            return 'You lose...'
                        }
                    })() }
                </div>
                <hr/>
                <div style={{fontSize: '0.8rem'}}>
                    3초 후에 메인화면으로 돌아갑니다..
                </div>
            </div>
        </div>
		
	}
    
}
export default EndBox