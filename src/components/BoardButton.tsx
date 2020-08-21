import React, { useEffect, useState } from 'react';
import EmoteBar from './EmoteBar';

const BoardButton = (props) => {
  
    return (
        <div className="btnbrd">
            <div className="darkbar" id="dark-left"></div>
            <div className="darkbar" id="dark-right"></div>
            <EmoteBar mood={props.mood[`A_${props.cmd}`]} name="leftbar"/>
            <EmoteBar mood={props.mood[`B_${props.cmd}`]} name="rightbar"/>
            <button onClick={()=>props.click([props.team[0],props.team[1],props.team[0] ? `A_${props.cmd}` : `B_${props.cmd}`])}>{props.children}</button>
        </div>
    );
};

export default BoardButton;