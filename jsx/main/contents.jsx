import React from 'react'
import ReactDOM from 'react-dom'
import Mundo from '../champion/mundo.jsx'

// 캐릭터, 맵, 공격 등, 게임 내용을 담고 있는 컴포넌트
class Content extends React.Component {
    // 본인과 상대, red와 blue의 관계를 어떻게 정의하느냐가 중요했습니다. 
    // 이를 위해서 플레이어의 색깔을 게임 이전에 정의한 뒤, 처음 constructor에서 캐릭터 객체를 만들 때 my와 other의 값에 색깔을 대입하였습니다.
    // 이렇게 하면 본인이 red인지 blue인지는 처음에 한번만 정의가 되고, 이후에는 myChampion과 otherChampion를 .render만 실행시키면 됩니다.
    // 또한 본인이 발생시키는 이벤트는 myChampion의 메소드,
    // 상대방이 발생시키는 이벤트는 otherChampion의 메소드를 발생시키는 방식으로 문제를 해결하였습니다.
    constructor(props) {
        super(props)
        // 본인의 챔피언에는 본인의 색깔, 상대의 챔피언에는 상대의 색깔을 입력합니다.
        // 본인의 myColor는 상대의 입장에서는 otherColor의 값입니다.
        this.myChampion = new Mundo(props, props.state.myColor, props.state.userId)
        this.otherChampion = new Mundo(props, props.state.otherColor, props.state.otherUserId)
        this.state = {
            init: 0, // 캐릭터의 이동, 마우스 움직임을 인식하고 setState를 위한 변수
            qFlag: false, // q스킬이 활성화 되어있는지 확인하는 플래그 (q를 한번 누르면 사정거리 표시, 한번 더 누르면 도끼가 날아갑니다.)
            qCooltime: 0, // q스킬의 쿨타임을 위한 변수입니다. 0이면 사용가능하고 스킬을 사용하면 값이 증가하고 1씩 감소합니다.
            userId: props.state.userId,
            otherUserId: props.state.otherUserId,
            winner: null
        }

        // 게임 배경음악입니다
        this.audio = new Audio()
        this.audio.volume = 0.2
        this.audio.src = '../audio/game.mp3'
        this.audio.loop = 'true'
        this.audio.play()

        // 승리 했을 때의 음악입니다.
        this.audioWin = new Audio()
        this.audioWin.volume = 0.2
        this.audioWin.src = '../audio/win.mp3'

        // 패배 했을 떄의 음악입니다.
        this.audioLose = new Audio()
        this.audioLose.volume = 0.2
        this.audioLose.src = '../audio/lose.mp3'

        // 함수들을 컴포넌트에 바인딩하는 과정입니다.
        this.handleContextMenu = this.handleContextMenu.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)

        // 상대의 마우스 우클릭 이벤트 발생을 감지하면, otherChampion의 메소드를 실행시킵니다.
        props.socket.on('contextMenu', function (data) {
            this.otherChampion.contextMenu(data, this)
        }.bind(this))

        // 상대방의 keydown을 감지하면, otherChampion의 메소드를 실행시킵니다.
        props.socket.on('keydown', function (data) {
            if (data.key == 'q') {
                this.otherChampion.q(this, this.otherChampion, this.myChampion, data.rad)
            }
        }.bind(this))

        props.socket.on('stop', function (data) {
            this.otherChampion.stop(this)
        }.bind(this))

        // 상대방의 마우스 왼쪽 클릭을 감지하면 ohterChampion의 메소드를 실행합니다.
        props.socket.on('click', function (data) {
            this.otherChampion.q(this, this.otherChampion, this.myChampion, data.rad)
        }.bind(this))
    }

    // keydown 이벤트의 경우, 포커싱이 되지 않으면 인지하지 못하기 때문에 window에 이벤트 리스너를 설정해줬습니다.
    componentWillMount() {
        window.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown)
    }

    // 우클릭 이벤트 처리입니다.
    handleContextMenu(event) {
        event.preventDefault() // context창 출력을 막습니다.
        // 상대방에게 우클릭 이벤트 발생과 필요한 정보를 알립니다.
        this.props.socket.emit('contextMenu', {
            pageX: event.pageX,
            pageY: event.pageY,
            otherSocketId: this.props.state.otherSocketId
        })
        // 본인의 우클릭 이벤트를 처리합니다.
        this.myChampion.contextMenu(event, this)
    }

    // 마우스가 이동할 때 해당 좌표를 계산합니다.
    handleMouseMove(event) {
        this.myChampion.mouseMove(event, this)
    }

    // 마우스 왼쪽 클릭 이벤트를 처리합니다.
    handleClick(event) {
        if (!this.state.qFlag) {
            // 만약 q가 이미 한번 실행된 경우, 공격을 실행하고 상대방에게 이벤트 발생을 전송합니다.
            this.myChampion.click(this, this.myChampion, this.otherChampion, this.myChampion.state.rad)
            this.props.socket.emit('click', {
                rad: this.myChampion.state.rad,
                otherSocketId: this.props.state.otherSocketId
            })
        }
    }

    // 키 다운 이벤트를 처리합니다.
    handleKeyDown(event) {
        //        본인의 키 다운 이벤트를 처리합니다. 처음 q가 눌러진다면 사정거리 표시, 두번째라면 공격합니다.
        this.myChampion.keydown(event, this, this.myChampion, this.otherChampion)
        if (this.state.qFlag) {
            // 만약 두번째라면 상대방에게 공격 이벤트를 전송합니다.
            this.props.socket.emit('keydown', {
                key: event.key,
                rad: this.myChampion.state.rad,
                otherSocketId: this.props.state.otherSocketId
            })
        }

        // 공격이 아닌 stop 명령을 실행합니다. 움직이던 캐릭터가 그 자리에 정지합니다.
        if ((event.key == 's') || (event.key == 'S') || (event.key == 'ㄴ')) {
            this.props.socket.emit('stop', {
                key: event.key,
                otherSocketId: this.props.state.otherSocketId
            })
        }

    }

    render() {
        if (this.state.winner) {
            // 만약 승자가 정해진다면 winner와 userId를 비교하여 다른 음악을 재생시킵니다.
            this.audio.pause()
            if (this.state.winner == this.state.userId) {
                this.audioWin.play()
            } else {
                console.log(this.state.winner)
                this.audioLose.play()
            }
            // 게임이 끝났기 때문에 모든 set을 중지합니다.
            clearInterval(this.myChampion.moveIntervalIdx)
            clearInterval(this.myChampion.qIntervalIdx)
            clearInterval(this.myChampion.axeMoveIntervalIdx)
            clearInterval(this.otherChampion.moveIntervalIdx)
            clearInterval(this.otherChampion.qIntervalIdx)
            clearInterval(this.otherChampion.axeMoveIntervalIdx)

            // 게임이 끝났음을 상대방에게 전송합니다.
            this.props.socket.emit('end', {
                winner: this.state.winner,
                socketId: this.props.state.socketId,
                otherSocketId: this.props.state.otherSocketId
            })
            return <div >
                loading...
                <
                /div>
        } else {
            // 게임 렌더링입니다.

            // 스킬 쿨타임 이미지를 위한 스타일입니다.
            let qCooltimeStyle = {
                position: 'absolute',
                width: '100px',
                height: '100px',
                left: 960,
                top: 540 + 300,
                zIndex: 0
            }

            // 스킬 쿨타임이 얼마 남았는지를 보여주는 스타일입니다.

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

            // 공격 설명을 위한 스타일입니다.
            let explainStyle = {
                position: 'absolute',
                left: 870,
                top: 540 + 400,
                fontSize: '1.5rem',
                border: '2px',
                color: 'white'
   return <div onContextMenu={this.handleContextMenu} onMouseMove={this.handleMouseMove} onClick={this.handleClick}>
				<img src = "../../../img/map.png"/>
				{this.myChampion.render()} <!--캐릭터를 직접 렌더링합니다.-->
				{this.otherChampion.render()}
				<img src="../img/mundo/qCooltime.png" style={qCooltimeStyle}/>
				<div style={circleStyle}></div>
				<div style={explainStyle}>Q를 눌러 공격하세요!</div>
			</div>         }

        }
    }
}

export default Content
