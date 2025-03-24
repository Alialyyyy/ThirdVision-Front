import React from 'react';
import '../../index.css';

function Founders () {
    
    const parentCont = {
        border: "1px solid rgba(0, 0, 0, 0.336)",
        borderRadius: "15px",
        boxShadow: "5px 5px 8px hsl(0, 82%, 2%)",
        padding: "20px",
        width: "500px", 
        background: "rgb(51, 66, 81)",
        color: "white",
        textAlign: "center",
        fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif'",
        fontSize: "15px", 
        margin: "10px",
    }

    const h1style = {
        fontSize: "30px",
    }

    return(
        <div style = {parentCont}>
            <h1 style = {h1style}>Founders</h1>
            <p>Frago Lariba Remo At kung ano pa bang pwede pang ialagay rito kahit di founders </p>
        </div>
    );
}

export default Founders;