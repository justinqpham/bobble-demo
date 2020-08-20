import React, { useEffect, useState } from 'react';

const Phone = (props) => {
    const [height, setHeight] = useState("");
    useEffect(()=>{
        if(props.squish){
            setHeight("calc(100% - 80px)"); 
        }else{
            setHeight("100%");
        }
        props.trigger();
    },[props.squish])
    
    return (
        <div className="wind" style={{height:height}}>
            {props.children}
        </div>
    );
};

export default Phone;