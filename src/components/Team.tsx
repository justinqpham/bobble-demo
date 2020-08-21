import React, { useEffect, useState } from 'react';

const Team = (props) => {
    const [display, setDisplay] = useState("none")
    useEffect(()=>{
        if(props.show) setDisplay("inline-block");
        if(!props.show) setDisplay("none");
    },[props.show])
  
    return (
        <button onClick={()=>props.select(props.team)} id={props.team}><div style={{display}} id="team-select"></div>{props.children}</button>
    );
};

export default Team;