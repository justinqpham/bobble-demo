import React, { useEffect, useState } from 'react';

const EmoteBar = (props) => {
  
    return (
        <div className={props.name} style={{width:`${50*props.mood*1.25}%`}}></div>
    );
};

export default EmoteBar;