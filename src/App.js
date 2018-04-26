import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import routers from './routers/router';
import history from './routers/history';
import { Router, Switch, Route } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
// import { History } from 'react-router'

import { Layout, Menu, Button } from 'antd';
import MapLj from "./components/Map";
import domain  from './domains';


const { Header, Content, Footer } = Layout;

const io = require('socket.io-client');
const socket = io.connect('http://localhost:1080/',{'forceNew':true});

class App extends Component {
    state = {
        loading: false,
        progress: '',
        redirect:false,
        city:'上海',
        cityCode:'sh'
    };
    spideOnce = () => {
        socket.emit('request', this.cityCode);
        socket.on('progress', function (data) {
            // console.log(data);
            this.setState({
                progress: data.progress,
                loading: true,
            });
            if(data.progress==='抓取完成！'){
                this.setState({
                    loading: false,
                });
                window.location.reload();
            }
        }.bind(this));
    };
    selectChange = (e) => {
        this.setState({redirect: true});
        this.setState({cityCode: e.target.value});
        // alert("?cityCode="+e.target.value+"&city="+domain[e.target.value]);
        window.location.href="?cityCode="+e.target.value+"&city="+domain[e.target.value];
        // history.push("?city=122")
    };


    render() {

       function GetRequest() {
           let strs;
           let url = decodeURI(window.location.href); //获取url中"?"符后的字串
           var theRequest = new Object();
           if (url.indexOf("?") != -1) {
               var str = url.substr(url.indexOf("?")+1);
               strs = str.split("&");
               for ( var i = 0; i < strs.length; i++) {
                   theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
               }
           }
           return theRequest;
       };

       var req=GetRequest();
       console.dir(req);
       this.city=req['city'];
        this.cityCode=req['cityCode'];

        const { progress, loading } = this.state;
        return (
            <Router history={history}>
                    <Layout className="layout">
                        <Header>
                            <h1 style={{float:'left',color:'#fff'}}>
                                楼盘网
                            </h1>
                            <div style={{float:'left',marginLeft:'1rem'}}>

                                <span style={{font:'0.2rem',color:"white"}}>选择城市</span>
                                <select defaultValue={this.cityCode} id="city" onChange={this.selectChange} >
                                    <option value ="sh">上海</option>
                                    <option value="bj">北京</option>
                                    <option value ="sz">深圳</option>
                                    <option value="xm">厦门</option>
                                    <option value="fz">福州</option>
                                    <option value ="nj">南京</option>
                                    <option value ="np">南平</option>
                                    <option value="tj">天津</option>
                                    <option value ="hz">杭州</option>
                                    <option value ="hf">合肥</option>
                                    <option value="cq">重庆</option>
                                    <option value ="cd">成都</option>
                                    <option value ="cs">长沙</option>
                                    <option value="jn">济南</option>
                                    <option value ="zz">郑州</option>
                                    <option value ="sz">苏州</option>
                                    <option value ="nc">南昌</option>
                                    <option value ="hhht">呼和浩特</option>
                                    <option value ="yz">扬州</option>
                                    <option value ="nb">宁波</option>
                                    <option value ="qz">泉州</option>


                                </select>
                                {/*<span style={{marginLeft:'1rem',font:'0.2rem',color:"white"}}>选择爬取的最大页数</span>*/}

                                {/*<select id="page">*/}
                                    {/*<option value ="4">4</option>*/}
                                    {/*<option value ="5">5</option>*/}
                                    {/*<option value ="6">6</option>*/}
                                    {/*<option value="7">7</option>*/}
                                    {/*<option value="8">8</option>*/}
                                    {/*<option value="9">9</option>*/}
                                    {/*<option value="10">10</option>*/}
                                    {/*<option value="11">11</option>*/}
                                {/*</select>*/}
                                </div>


                            <Button type="primary" style={{marginLeft:'15px'}} onClick={() => this.spideOnce()} loading={loading}>
                                {progress===''?'抓一下':progress}
                            </Button>
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                defaultSelectedKeys={['0']}
                                style={{ lineHeight: '64px', float:'right'}}
                            >
                                {routers.map(function (route, i) {
                                    return (
                                        <Menu.Item key={i}>
                                            <Link to={route.path}>
                                                {route.name}
                                            </Link>
                                        </Menu.Item>
                                    )
                                })}
                            </Menu>
                        </Header>
                        <Content style={{ padding: '0 50px' }}>
                            <Switch>
                                {routers.map((route, i) => {
                                        return <Route key={i} exact path={route.path} component={route.component}/>
                                })}
                            </Switch>
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>
                            Spider ©2018
                        </Footer>
                    </Layout>

            </Router>
        );
    }
}

export default App;
