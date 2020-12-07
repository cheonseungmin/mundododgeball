import React from 'react'
import axios from 'axios'
import socketIo from 'socket.io-client'

// 현재 접속 중인 사용자 목록을 알려주는 컴포넌트
class userList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            users: null, // 사용자 배열
            page: 1, // 현재 페이지
            list: 1 // 전체 페이지
        }
    }
    userList() {
        axios.get('/userList').then(function (res) {
            this.setState({
                users: res.data.users, // 사용자 목록을 받아옴
                // 사용자를 5명씩 보여줌, 5명으로 딱 나눠진다면 (ex 10명) 2페이지, 아니라면 (ex 11명) +1을 해서 3페이지가 된다.
                list: ((res.data.users.length % 5) == 0) ? ((res.data.users.length / 5)) : (parseInt(res.data.users.length / 5) + 1)
            })
        }.bind(this))
    }

    // 원하는 사용자를 초대하는 함수
    invite(event) {
        // 서버에 클릭한 event의 정보를 전송하여 상대방과 연결을 요청한다.
        axios.post('/invite', {
            userId: this.props.state.userId,
            socketId: this.props.state.socketId,
            otherUserId: event.target.id
        })
    }

    // 현재 -1 페이지를 보여줌
    prePage() {
        if (1 < this.state.page) {
            this.setState({
                page: this.state.page - 1
            })
        }
    }

    // 현재 +1 페이지를 보여줌
    nextPage() {
        if (this.state.page < this.state.list) {
            this.setState({
                page: this.state.page + 1
            })
        }
    }

    render() {
		return (
			<div>
				<input type="submit" value="사용자 목록 보기" onClick={this.userList.bind(this)}></input><br/> <!-- 사용자 목록 보기 버튼을 누르면 유저 목록을 서버로부터 받아와 출력한다.-->
				{(
					()=>{
						if(this.state.users){
							return <div>
										<div style={{height: '140px'}}>
											{
												this.state.users.slice((this.state.page-1)*5, ((this.state.page-1)*5)+5).map((user, i) => { // 현재 페이지의 5명을 출력한다. 만약 그 사용자가 gaming 상태라면 출력하지 않는다.
													if((user.userId != this.props.state.userId) && (user.userId != '') && (user.state != "gaming"))
														return <div key={user.userId} style={{padding: 'padding: 5px 5px 5px 0px'}}>
																	<button id={user.userId} onClick={this.invite.bind(this)}>
																		초대하기
																	</button>&nbsp;
																	{user.userId}
															</div>
												})
											}
										</div>
										<div style={{verticalAlign:'bottom', textAlign: 'center'}}>
										<button onClick={this.prePage.bind(this)}>&lt;</button> <!--페이지 이동 버튼들-->
										&nbsp; {this.state.page} / {this.state.list} &nbsp;
										<button onClick={this.nextPage.bind(this)}>&gt;</button>
							</div>
								</div>
						}	else {
								return <div>
											사용자 목록 보기를 눌러주세요.<br/>
										</div>
							}	
					}
				)()}
			</div>
		)
	}
}

export default userList
