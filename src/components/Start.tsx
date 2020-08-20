import React, { useEffect, useRef, useState, Fragment } from 'react';
import bufferedAudio from '../buffered_audio';
import Modal from './Modal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsofService from './TermsofService';
import Disclaimer from './Disclaimer';

const AudioContext = window.AudioContext // Default
    || (window as any).webkitAudioContext // Safari and old versions of Chrome
    || false; 

const Start = (props) => {
    const [display, setDisplay] = useState("block");
    const [disclaimer, setDisclaimer] = useState(false);
    const [pp, setPP] = useState(false);
    const [tos, setToS] = useState(false);

    useEffect(()=>{
        if(props.display) setDisplay("block");
        if(!props.display) setDisplay("none");
    },[props.display]);

    const handleClick = () => {
        const context = new AudioContext({
            sampleRate: 44100
        });
          
        const buffer = bufferedAudio(context);
        buffer.initialize().then(async (finalize)=>{
            props.change();
            await props.onStart_(buffer, finalize, context);
        });
    }

    return (
        <div id="start" style={{display:display}}>
            <div id="startlogo">
                <img src="/static/logo.png" />
            </div>
            <div id="soundon"><p>Your button presses will be combined with reactions from other fans to create a collective crowd audio stream delivered to your device.<br/><br/><span style={{fontWeight: 800}}>Tap buttons faster for a more intense reaction!</span></p></div>
            <button onClick={handleClick} id="enter"><div><img src="/static/assets/enter.png"/></div></button>
            <footer id="disclaimer"><p><span><p onClick={()=>{setDisclaimer(true);window.scrollTo(0, 0);}}>Disclaimer</p></span> | <span><p onClick={() =>{setPP(true);window.scrollTo(0, 0);}}>Privacy Policy</p></span> | <span><p onClick={() =>{setToS(true);window.scrollTo(0, 0);}}>Terms of Service</p></span></p></footer>
            <Modal propid={"fullscreen"} show={disclaimer}><div className="closeModal"></div><button className="closeButton" onClick={()=>setDisclaimer(false)}><img src="/static/assets/chevron.png"/></button><Disclaimer/></Modal>
            <Modal propid={"fullscreen"} show={pp}><div className="closeModal"></div><button className="closeButton" onClick={()=>setPP(false)}><img src="/static/assets/chevron.png"/></button><PrivacyPolicy/></Modal>
            <Modal propid={"fullscreen"} show={tos}><div className="closeModal"></div><button className="closeButton" onClick={()=>setToS(false)}><img src="/static/assets/chevron.png"/></button><TermsofService/></Modal>
        </div>
        
    );
};

export default Start;