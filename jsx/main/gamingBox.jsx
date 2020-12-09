import React from 'react'
import ReactDOM from 'react-dom'
import Contents from './contents.jsx'

// 게임에 대한 직접적인 내용을 담고 있는 컴포넌트
class GamingBox extends React.Component {
	constructor(props) {
		super(props)
		this.main = props.main // main의 함수와 상태를 이용하기 위함
	}
	
	render() {
            
        this.main.audio.pause()
        return (
            <div>
                <Contents socket={this.main.socket} state={this.main.state}/>
            </div>
        )
    } 
}

export default GamingBox