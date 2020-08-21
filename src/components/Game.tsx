import React, { useEffect, useState, useRef } from 'react';
// COMPONENTS
import MenuBtn from './MenuBtn';
import HomeBtn from './HomeBtn';
import Modal from './Modal';
import Disclaimer from './Disclaimer';
import PrivacyPolicy from './PrivacyPolicy';
import TermsofService from './TermsofService';
import Team from './Team';
import BoardButton from './BoardButton';

const Game = (props) => {
    const [display, setDisplay] = useState("inline-block");
    const [menu, setMenu] = useState(false);
    const [sound, setSound] = useState([false,{backgroundColor:"transparent"}]);
    const [share, setShare] = useState([false,{backgroundColor:"transparent"}]);
    const [legal, setLegal] = useState([false,{backgroundColor:"transparent"}]);
    const [pp, setPP] = useState(false);
    const [tos, setToS] = useState(false);
    const menuimg = useRef("/static/assets/settings.png");
    const [crowd, setCrowd] = useState([{backgroundColor:"transparent"},{backgroundColor: "white", float:"left"}]);
    const [team, setTeam] = useState([true,false]);
  
    useEffect(()=>{
        if(props.display) setDisplay("flex");
        if(!props.display) setDisplay("none");
    },[props.display]);

    useEffect(()=>{
        if(!props.state.crowd){
            setCrowd([{backgroundColor:"transparent"},{backgroundColor: "white", float:"left"}]);
        }else{
            setCrowd([{backgroundColor:"white"},{backgroundColor: "#282c34", float: "right"}])
        }
    },[props.state.crowd]);

    const handleMenu = () => {
        if(menu){
          menuimg.current = "/static/assets/settings.png"
          setSound([false,style(false)]);
          setShare([false,style(false)]);
          setLegal([false,style(false)]);
        }else{
          menuimg.current = "/static/assets/close.png"
          setSound([true,style(true)]);
        }
        setMenu(!menu);
    }

    const style = (val) => {
        if(val) return {backgroundColor:"#282c34"};
        if(!val) return {backgroundColor:"transparent"};
    }

    const handleOpts = (option: string) => {
        if(option === "sound"){
            setSound([!sound[0], style(!sound[0])]);
            setShare([false, style(false)]);
            setLegal([false, style(false)]);
        }
        if(option === "share"){
            setSound([false, style(false)]);
            setShare([!share[0], style(!share[0])]);
            setLegal([false, style(false)]);
        }
        if(option === "legal"){
            setSound([false,style(false)]);
            setShare([false,style(false)]);
            setLegal([!legal[0],style(!legal[0])]);
        }
    }
    
    const teamSelect = (team) => {
        if(team === "away-team"){
            setTeam([true,false]);
        }else{
            setTeam([false,true]);
        }
    }

    return (
        <div id="clean" style={{display:display}}>
            <div id="backleft"></div>
            <div id="backright"></div>
            <div id="teams"><Team select={teamSelect} team="away-team" show={team[0]}><h1>A</h1></Team><Team select={teamSelect} team="home-team" show={team[1]}><h1>B</h1></Team></div>
            <div id="brd">
                <BoardButton mood={props.mood} click={props.emote} cmd={"Cheering"} team={team}><img src="/static/assets/cheering.png" alt=""/></BoardButton>
                <BoardButton mood={props.mood} click={props.emote} cmd={"BuildUp"} team={team}><img src="/static/assets/buildup.png" alt=""/></BoardButton>
                <BoardButton mood={props.mood} click={props.emote} cmd={"Clapping"} team={team}><img src="/static/assets/clapping.png" alt=""/></BoardButton>
                <BoardButton mood={props.mood} click={props.emote} cmd={"LetDown"} team={team}><img src="/static/assets/letdown.png" alt=""/></BoardButton>
                <BoardButton mood={props.mood} click={props.emote} cmd={"Booing"} team={team}><img src="/static/assets/booing.png" alt=""/></BoardButton>
            </div>
            <HomeBtn show={props.state.game} back={props.back}/>
            <div id="game-logo"><a href="http://www.bobblesports.com" target="_blank"><img src="/static/logo512.png"/></a></div>
            <Modal propid="menu" show={menu}>
                <div id="menubtns">
                    <button className="tabbtns" style={sound[1]} onClick={()=>handleOpts("sound")}><img src="/static/assets/sound.png" alt=""/></button>
                    <button className="tabbtns" style={share[1]} onClick={()=>handleOpts("share")}><img src="/static/assets/share.png" alt=""/></button>
                    <button className="tabbtns" style={legal[1]} onClick={()=>handleOpts("legal")}><img src="/static/assets/legal.png" alt=""/></button>
                </div>
            </Modal>
            <Modal propid="legal" show={legal[0]}>
                <div id="legaldiv"><p><span><p onClick={() =>{setPP(true);window.scrollTo(0, 0);}}>Privacy Policy</p></span> | <span><p onClick={() =>{setToS(true);window.scrollTo(0, 0);}}>Terms of Service</p></span></p></div>
            </Modal>
            <Modal propid="share"  show={share[0]}>
                <div id="share-buttons">
                <a href="https://twitter.com/share?url=https://www.boothestros.com&amp;text=Boo%20the%20Astros!&amp;hashtags=bootheastros,Astros,Asterisks,Trashtros" target="_blank">
                    <img src="https://simplesharebuttons.com/images/somacro/twitter.png" alt="Twitter" />
                </a>
                <a href="http://www.facebook.com/sharer.php?u=https://www.boothestros.com" target="_blank">
                    <img src="https://simplesharebuttons.com/images/somacro/facebook.png" alt="Facebook" />
                </a>
                <a href="http://www.linkedin.com/shareArticle?mini=true&amp;url=https://www.boothestros.com" target="_blank">
                    <img src="https://simplesharebuttons.com/images/somacro/linkedin.png" alt="LinkedIn" />
                </a>
                <a href="http://reddit.com/submit?url=https://www.boothestros.com&amp;title=Boo the Astros" target="_blank">
                    <img src="https://simplesharebuttons.com/images/somacro/reddit.png" alt="Reddit" />
                </a>
                <a href="mailto:?Subject=Boo the Astros&amp;Body=I%20saw%20this%20and%20thought%20of%20you!%20 https://www.boothestros.com">
                    <img src="https://simplesharebuttons.com/images/somacro/email.png" alt="Email" />
                </a>              
                </div>
            </Modal>
            <Modal propid="sound" show={sound[0]}>
                <div id="sound-buttons">
                    <div className="toggle-box" id="crowd">
                        <p>Crowd FX</p>
                        <div className="wrap-toggle">
                            <p>Off</p>
                            <button className="toggle-switch" style={crowd[0]} onClick={props.tog}>
                                <div className="toggle-nib" style={crowd[1]}></div>
                            </button>
                            <p>On</p>
                        </div>                        
                    </div>
                </div>
            </Modal>
            <MenuBtn menu={handleMenu} menuimg={menuimg.current}/>
            <Modal propid={"fullscreen"} show={pp}><div className="closeModal"></div><button className="closeButton" onClick={()=>setPP(false)}><img src="/static/assets/chevron.png"/></button><PrivacyPolicy/></Modal>
            <Modal propid={"fullscreen"} show={tos}><div className="closeModal"></div><button className="closeButton" onClick={()=>setToS(false)}><img src="/static/assets/chevron.png"/></button><TermsofService/></Modal>
        </div>
    );
};

export default Game;