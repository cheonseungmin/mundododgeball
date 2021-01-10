import React from 'react';

import LogoutBox from './logoutBox.jsx';
import LoginBox from './loginBox.jsx';
import DuplicateBox from './duplicateBox.jsx';
import GamingBox from './gamingBox.jsx';
import EndBox from './endBox.jsx';

// 게임에 대한 직접적인 내용을 담고 있는 컴포넌트
class Box extends React.Component {
	constructor(props) {
		super(props)
		this.main = props.main // main의 함수와 상태를 이용하기 위함
	}
	
	render() {
        
        if(this.main.state.state == 'logout') { // main 컴포넌트의 상태에 따른 컴포넌트 라우팅
			return <LogoutBox main={this.main}/>
            
		} else if(this.main.state.state == 'login') {
			return <LoginBox main={this.main}/>
            
		} else if(this.main.state.state == 'duplicate') { // 아이디 로그인을 했지만 중복된 아이디를 입력한 경우
            return <DuplicateBox main={this.main}/>
            
		}	else if(this.main.state.state == 'gaming') { // 초대를 승락하여 게임이 시작된 경우, Contents 컴포넌트를 렌더링한다.
            return <GamingBox main={this.main}/>
            
		} else if(this.main.state.state == 'end') { // 게임이 끝난 경우, 10초 뒤에 자동 로그아웃이 되게 한다.
            return <EndBox main={this.main}/>
		}
	}
    
}
export default Box