import React, { useEffect, useState } from 'react';

const Modal = (props) => {
  const [display,setDisplay] = useState("none");
  useEffect(()=>{
    if(props.show) setDisplay("inline-block")
    if(!props.show) setDisplay("none")
  },[props.show])
    
    return (
        <div id={props.propid} className="modal" style={{display:display}}>
            {props.children}
        </div>
    );
};

export default Modal;