import React, { useEffect, useState } from 'react';

const MenuBtn = (props) => {
  
    return (
        <button id="burger" onClick={props.menu}><img src={props.menuimg}/></button>
    );
};

export default MenuBtn;