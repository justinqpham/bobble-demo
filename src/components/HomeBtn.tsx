import React, { useEffect, useState } from 'react';

const HomeBtn = (props) => {
    const [display, setDisplay] = useState("none")
    useEffect(()=>{
        if(props.show) setDisplay("block");
        if(!props.show) setDisplay("none");
    },[props.show])
  
    return (
        <button id="burger" onClick={props.back} style={{left:"15px",display:display}}><img src="/static/assets/home.png"/></button>
    );
};

export default HomeBtn;