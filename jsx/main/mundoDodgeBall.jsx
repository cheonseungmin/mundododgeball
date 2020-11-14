import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import Main from './main.jsx'

//#mundoDodgeBall을 찾아 Main 컴포넌트로 렌더링한다.
ReactDOM.render(
    <Main/>,
    document.getElementById('mundoDodgeBall')
)