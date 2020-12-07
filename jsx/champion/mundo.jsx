import React from 'react'
import ReactDOM from 'react-dom'

// 캐릭터 컴포넌트
class Mundo extends React.Component {
    constructor(props, color, userId) { // 사용자 컬러, 아이디를 인자로 받는다.
        super(props)
        this.state = {
            color: color,
            img: "../img/mundo/mundoFront.png",
            widthHalf: 130, // 캐릭터의 가로 길이 260의 절반
            heightHalf: 70, // 캐릭터의 세로 길이 140의 절반
            x: ((color == 'red') ? (800) : (1250)), // 캐릭터가 레드라면 시작 x좌표 800, 블루라면 시작 x 좌표 1250
            y: ((color == 'red') ? (400) : (750)), // 캐릭터가 레드라면 시작 y좌표 400, 블루라면 시작 y 좌표 750
            moveIntervalIdx: null, // 캐릭터 이동을 위한 setInterval 변수
            direction: 'Front', // 출력될 캐릭터 이미지 Front, Back, Left, Right
            rad: 0, // 캐릭터와 마우스의 라디안
            degree: null, // 캐릭터와 마우스의 각도
            qFlag: false, // 캐릭터의 q스킬 활성화 여부
            qRangeVisibility: 'hidden', // 캐릭터 q스킬의 사정거리 활성화 여부
            axeX: ((color == 'red') ? (800) : (1250)), // 캐릭터의 무기인 도끼의 시작 x좌표
            axeY: ((color == 'red') ? (400) : (750)), // 캐릭터의 무기인 도끼의 시작 y좌표
            axeVisibility: 'hidden', // 캐릭터의 무기인 도끼의 시각 활성화 여부
            qCooltime: 0, // q스킬의 스킬 제한 시간
            qIntervalIdx: null, // q스킬의 쿨타임 감소 표현을 위한 setInterval 변수
            axeMoveIntervalIdx: null, // 도끼의 날아감 표현을 위한 setInterval 변수
            userId: userId, // 사용자 아이디
            health: 150, // 캐릭터 체력
            damage: 30, // 도끼 데미지
        }

        // q쿨타임이 0이 되면 "문도!" 소리가 난다.
        this.audioCooltime = new Audio()
        this.audioQ = new Audio()
        this.audioCooltime.volume = 0.2
        this.audioCooltime.src = '../audio/mundo.mp3'
        this.audioQ.volume = 0.2
    }

    // 캐릭터의 오른쪽 마우스 클릭 메소드
    // 1. 각도를 구하고 그에 맞는 캐릭터 이미지를 변경한다.
    // 2. 목표 좌표까지 setInterval을 통해 좌표를 이동한다.
    // 3. 목표 좌표까지 도달하면 setInterval을 삭제한다.
    contextMenu(event, contents) {

        // 1. 각도 구하기
        clearInterval(this.state.moveIntervalIdx) // 기존의 움직임을 취소함
        let pageX = event.pageX // 클릭 x좌표
        let pageY = event.pageY // 클릭 y좌표
        this.state.rad = Math.atan2(this.state.y - pageY, this.state.x - pageX) // 마우스와 캐릭터 사이의 라디안을 구함
        this.state.degree = (this.state.rad * 180) / Math.PI // 라디안의 각도 표현

        // 1. 이미지 변경하기
        if ((-45 <= this.state.degree) && (this.state.degree < 45)) { // 이동할 각도가 좌측일 때
            this.state.direction = "Left"
            this.state.img = "../img/mundo/mundoLeft.gif" // 움직임을 표현하는 .gif 파일로 교체한다.
            this.state.widthHalf = 70 // 캐릭터의 가로 길이의 절반
            this.state.heightHalf = 115 // 캐릭터의 세로 길이의 절반
        } else if ((45 <= this.state.degree) && (this.state.degree < 135)) { // 이동할 각도가 뒤쪽일 때
            this.state.direction = "Back"
            this.state.img = "../img/mundo/mundoBack.gif"
            this.state.widthHalf = 130
            this.state.heightHalf = 70
        } else if ((-135 <= this.state.degree) && (this.state.degree < -45)) { // 이동할 각도가 정면일 때
            this.state.direction = "Front"
            this.state.img = "../img/mundo/mundoFront.gif"
            this.state.widthHalf = 130
            this.state.heightHalf = 70
        } else { // 이동할 각도가 우측일 때
            this.state.direction = "Right"
            this.state.img = "../img/mundo/mundoRight.gif"
            this.state.widthHalf = 60
            this.state.heightHalf = 115
        }



        // 목표 지점까지의 거리 구하기
        let distance = Math.sqrt(Math.pow((pageX - this.state.x), 2) + Math.pow((pageY - this.state.y), 2))
        if (distance == 0) return null // 거리가 0이면 return


        let step = 10 // 캐릭터의 이동 보폭
        // 대각선 이동 이동한 길이가 step이 되기 위해 stepX와 stepY를 구해야 함
        // (pageX - this.state.x) : stepX = distance : step => 공식을 이용
        let stepX = ((pageX - this.state.x) * step) / distance
        let stepY = ((pageY - this.state.y) * step) / distance

        // 2. 목표 좌표까지 캐릭터 좌표 이동
        this.state.moveIntervalIdx = setInterval(function () {
            let flagX = false // x 거리 도달 여부
            let flagY = false // y 거리 도달 여부
            if (Math.abs(pageX - this.state.x) < Math.abs(stepX)) {
                // 목표와 캐릭터 거리가 stepX보다 작은 경우 즉, step은 10인데 남은 거리가 8인 경우에는 8만큼만 이동해야 한다.
                stepX = pageX - this.state.x
                flagX = true
            }
            if (Math.abs(pageY - this.state.y) < Math.abs(stepY)) {
                // 목표와 캐릭터 거리가 stepY보다 작은 경우 즉, step은 10인데 남은 거리가 8인 경우에는 8만큼만 이동해야 한다.
                stepY = pageY - this.state.y
                flagY = true
            }

            let testX = this.state.x + stepX // 이동 후의 x좌표
            let testY = this.state.y + stepY // 이동 후의 y좌표


            // 캐릭터 움직임을 제한하기 위한 좌표
            let x11 = 640 + 50 // 지도 상에서의 11시 쪽 모서리 좌표
            let y11 = 0 + 340 - 30 // 지도 상에서의 11시 쪽 모서리 좌표

            let x5 = 1360 + 30 // 지도 상에서의 5시 쪽 모서리 좌표
            let y5 = 0 + 920 - 50 // 지도 상에서의 5시 쪽 모서리 좌표

            let midX = 960 // 지도 가운데 x좌표
            let midY = 540 // 지도 가운데 y좌표

            if (this.state.color == 'red') {
                // 레드일 때
                if (testX >= midX) {
                    // 가운데 보다 더 갈 수 없다
                    flagX = true
                    flagY = true
                }
            } else {
                // 블루일 때
                if (testX <= midX) {
                    // 가운데 보다 더 갈 수 없다
                    flagX = true
                    flagY = true
                }
            }

            // 지도의 모서리보다 더 나아갈 수 없다
            if (((testX < x11) || (x5 < testX)) || ((testY < y11) || (y5 < testY))) {
                flagX = true
                flagY = true
            }

            // 위치에 도착한 경우 이미지를 .gif에서 .png로 교체한다.
            if (flagX && flagY) {
                this.state.img = "../img/mundo/mundo" + this.state.direction + ".png"
                clearInterval(this.state.moveIntervalIdx)
                contents.setState({
                    init: 0
                })
            } else {
                // 도착하지 않은 경우 위치를 바꾸거 setState를 해준다.
                this.state.x = testX
                this.state.y = testY
                contents.setState({
                    init: 0
                })
            }
        }.bind(this), 30)
    }

    // 마우스 움직임을 감지하는 메소드
    mouseMove(event, contents) {
        // 좌표, 라디안, 각도를 구한다.
        let pageX = event.pageX
        let pageY = event.pageY
        this.state.rad = Math.atan2(this.state.y - pageY, this.state.x - pageX)
        this.state.degree = (this.state.rad * 180) / Math.PI

        // 구한 좌표를 적용시키기 위해 init을 수정한다. => 사정거리가 표시 중 이라면 마우스를 따라와야 하기 때문이다.
        contents.setState({
            init: (contents.state.init == 0) ? 1 : 0
        })
    }

    // 키보드 이벤트를 처리하는 메소드
    keydown(event, contents, myChampion, otherChampion) {
        if (event.key == 'q' || event.key == 'Q' || event.key == 'ㅂ') {
            // q인 경우
            if (this.state.qFlag) {
                // q가 이미 한번 실행 됐다면 이번에는 공격으로 바뀐다.
                this.q(contents, myChampion, otherChampion, myChampion.state.rad) // q 스킬 실행
                // 실행 뒤에 초기화 시켜준다
                this.state.qFlag = false
                this.state.qRangeVisibility = 'hidden'
                contents.setState({
                    init: 0,
                    qFlag: true
                })
            } else {
                // 처음 실행되는 거라면 사정거리를 표시하고 플래그를 끈다.
                this.state.qFlag = true
                this.state.qRangeVisibility = 'visible'
                contents.setState({
                    init: 0,
                    qFlag: false
                })
            }
        } else if (event.key == 's' || event.key == 'S' || event.key == 'ㄴ') {
            // s인 경우 캐릭터 움직임을 정지시키는 stop을 발생시킨다.
            this.stop(contents)
        }
    }

    // q 스킬을 처리하는 메소드, 본인 캐릭터1의 도끼가 상대방인 캐릭터2의 좌표로 도달하는지 체크한다.
    // 1. 쿨타임 체크
    // 2. 사정거리를 계산하고 도끼를 날린다.
    // 3. 도끼가 끝에 도달하거나 상대방을 맞춘다면 setInterval을 제거한다.
    q(contents, champion1, champion2, rad) {
        if (champion1.state.qCooltime != 0) return null // q의 쿨타임이 0이 아니라면 아무것도 실행하지 않는다.
        this.audioQ.src = '../audio/attack.mp3' // 도끼가 날아가는 음악 실행
        this.audioQ.play()
        champion1.state.axeX = champion1.state.x // 도끼의 시작 좌표를 캐릭터의 좌표로 설정한다.
        champion1.state.axeY = champion1.state.y

        // 쿨타임을 재설정한다.
        champion1.state.qCooltime = 3
        champion1.state.qIntervalIdx = setInterval(function () {
            champion1.state.qCooltime = champion1.state.qCooltime - 1
            if (this.state.qCooltime == 0) { // 쿨타임이 완료 됐음을 알린다.
                this.audioCooltime.play()
                clearInterval(champion1.state.qIntervalIdx)
            }
            contents.setState({ // 남은 쿨타임을 그림으로 표현하기 위해서 init을 사용한다.
                init: 0,
                qCooltime: contents.myChampion.state.qCooltime
            })
        }.bind(this), 1000)

        champion1.state.axeVisibility = 'visible' // 도끼가 보이기 시작한다.

        // 도끼 던지기 계산 시작.
        let targetX = champion1.state.x - (Math.cos(rad) * 400) // 도끼의 사정거리가 400임을 고려한 목표지점의 x좌표를 구한다.
        let targetY = champion1.state.y - (Math.sin(rad) * 400) // 도끼의 사정거리가 400임을 고려한 목표지점의 y좌표를 구한다.
        let step = 10 // 도끼는 10의 속도로 날아간다.
        let stepX = (((targetX - champion1.state.x) * step) / 400) // 대각선 이동 거리가 10이 되기 위한 x좌표를 구한다.
        let stepY = (((targetY - champion1.state.y) * step) / 400) // 대각선 이동 거리가 10이 되기 위한 y좌표를 구한다.

        // 도끼가 날아가기 시작한다
        champion1.state.axeMoveIntervalIdx = setInterval(function () {
            let flagX = false // x거리 도달 여부
            let flagY = false // y거리 도달 여부
            if (Math.abs(targetX - champion1.state.axeX) <= Math.abs(stepX)) {
                // 목표와 캐릭터 거리가 stepㅋ보다 작은 경우 즉, step은 10인데 남은 거리가 8인 경우에는 8만큼만 이동해야 한다.
                stepX = targetX - champion1.state.axeX
                flagX = true
            }
            if (Math.abs(targetY - champion1.state.axeY) <= Math.abs(stepY)) {
                // 목표와 캐릭터 거리가 stepY보다 작은 경우 즉, step은 10인데 남은 거리가 8인 경우에는 8만큼만 이동해야 한다.
                stepY = targetY - champion1.state.axeY
                flagY = true
            }

            if ((champion2.state.x - champion2.state.widthHalf <= champion1.state.axeX) && (champion1.state.axeX <= champion2.state.x + champion2.state.widthHalf)) {
                if ((champion2.state.y - champion2.state.heightHalf <= champion1.state.axeY) && (champion1.state.axeY <= champion2.state.y + champion2.state.heightHalf)) {
                    // 도끼가 상대 챔피언의 좌표에 도달하게 된 경우
                    this.audioQ.src = '../audio/damage.mp3' // 타격 음악을 실행한다.
                    this.audioQ.play()
                    flagX = true
                    flagY = true
                    champion2.state.health = champion2.state.health - champion1.state.damage // 대상의 체력이 감소한다.
                }
            }

            // 도끼가 이동한다.
            champion1.state.axeX = champion1.state.axeX + stepX
            champion1.state.axeY = champion1.state.axeY + stepY

            if (flagX && flagY) {
                // 도끼가 사정거리, 상대방에게 도달한 경우
                champion1.state.axeX = champion1.state.x
                champion1.state.axeY = champion1.state.y
                champion1.state.axeVisibility = 'hidden' // 도끼를 숨긴다.
                contents.setState({
                    init: 0 // 도끼 사라짐을 표현하기 위함
                })
                if (champion2.state.health == 0) {
                    // 상대의 체력이 0이 된 경우에 게임을 승자를 종료하고 승자를 정한다.
                    clearInterval(champion1.state.qIntervalIdx)
                    contents.setState({
                        winner: champion1.state.userId
                    })
                }
                clearInterval(champion1.state.axeMoveIntervalIdx)
            }
            contents.setState({
                init: 0 // 도끼의 이동을 표현하기 위함
            })
        }.bind(this), 20)
        champion1.state.qFlag = false // 도끼가 던져졌음으로 플래그를 초기화 한다.
    }

    // 이동중인 캐릭터를 멈추게 하는 하는 메소드
    stop(contents) {
        this.state.img = "../img/mundo/mundo" + this.state.direction + ".png"
        clearInterval(this.state.moveIntervalIdx)
        this.state.qFlag = false // 실행 중인 q를 취소하는 기능도 있다.
        this.state.qRangeVisibility = 'hidden'
        contents.setState({
            init: 0 // 변경점을 적용시키기 위함
        })
    }

    // 마우스 왼쪽 클릭 이벤트를 처리하는 메소드
    // content.state.qFlag가 false일 때 실행된다.
    // content.state.qFlag는 장전 전에 true였다가, 첫번째 q를 눌렀을 때에 false가 된다.
    // myChampion.qFlag와는 boolean 값이 반대이다.
    click(contents, myChampion, otherChampion, rad) {
        myChampion.q(contents, myChampion, otherChampion, rad)
        myChampion.state.qFlag = false
        myChampion.state.qRangeVisibility = 'hidden'
        contents.setState({
            qFlag: true
        })
    }


    render() {
        // 캐릭터 표현을 위한 스타일
        let mundoStyle = {
            position: 'absolute',
            display: 'inlineBlock',
            width: '' + (this.state.widthHalf * 2) + 'px',
            height: '' + (this.state.heightHalf * 2) + 'px',
            left: '' + (this.state.x - this.state.widthHalf) + 'px',
            top: '' + (this.state.y - this.state.heightHalf) + 'px'
        }

        // q스킬 사정거리 표현을 위한 스타일
        let qRangeStyle = {
            visibility: this.state.qRangeVisibility,
            position: 'absolute',
            width: '800px',
            height: '60px',
            left: this.state.x - 400,
            top: this.state.y - 30,
            transform: 'rotate(' + this.state.degree + 'deg)',
        }

        // 도끼 표현을 위한 스타일
        let axeStyle = {
            width: '100px',
            height: '100px',
            visibility: this.state.axeVisibility,
            position: 'absolute',
            left: this.state.axeX - 50,
            top: this.state.axeY - 50
        }

        // 캐릭터 머리 위의 사용자 아이디 표현을 위한 스타일
        let userIdStyle = {
            position: 'absolute',
            left: this.state.x - 120,
            top: this.state.y - 190,
            color: 'white'
        }

        // 캐릭터 머리 위의 체력 상태 표현을 위한 스타일
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
                <div style = {userIdStyle}> {this.state.userId} </div> 
                <div style = {healthStyle}> </div> 
                <img src = {this.state.img} style = {mundoStyle}/> 
                <img src = "../img/mundo/mundoQRange.png" style = {qRangeStyle}/> 
                <img src = "../img/mundo/mundoAxe.gif" style = {axeStyle}/> 
            </div>
    }
}

export default Mundo
