import React from 'react'
import axios from 'axios'
import socketIo from 'socket.io-client'

class userList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			users: null,
			page: 1,
			list: 1
		}
	}
	userList() {
		axios.get('/userList').then(function(res) {
			this.setState({
				users: res.data.users,
				list: ((res.data.users.length % 5) == 0)? ((res.data.users.length / 5)): (parseInt(res.data.users.length / 5) + 1)
			})
		}.bind(this))
	}
	
	invite(event) {
		axios.post('/invite', {
			userId: this.props.state.userId,
			socketId: this.props.state.socketId,
			otherUserId: event.target.id
		})
	}
	
	prePage() {
		if(1 < this.state.page){
			this.setState({
				page: this.state.page - 1
			})
		}
	}
	
	nextPage() {
		if(this.state.page < this.state.list){
			this.setState({
				page: this.state.page + 1
			})
		}
	}
	
	render() {
		return (
			<div>
				<input type="submit" value="사용자 목록 보기" onClick={this.userList.bind(this)}></input><br/>
				{(
					()=>{
						if(this.state.users){
							return <div>
										<div style={{height: '140px'}}>
											{
												this.state.users.slice((this.state.page-1)*5, ((this.state.page-1)*5)+5).map((user, i) => {
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
										<button onClick={this.prePage.bind(this)}>&lt;</button>
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