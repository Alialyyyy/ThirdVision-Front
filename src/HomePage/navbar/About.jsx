import React from 'react';
import '../../index.css';

function About () {
    
    const pstyle = {
        padding: "10px",
        background: "rgb(255, 255, 255)",
        color: "black",
        textAlign: "center",
        fontFamily: "Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif'",
        fontSize: "20px", 
        margin: "10px",
    }

    const h1style = {
        margin: "50px",
        padding: "10px",
        fontSize: "80px",
        color:"rgb(118, 118, 118)",
        fontWeight: "small",
        fontFamily: "Lucida sans",
    }

    const h2style = {
        color: "rgb(184, 181, 181)",
        padding: "20px",

    }

    return(
        <>
            <h1 style = {h1style}>What is ThirdVision? 
            <h2 style = {h2style}>___________________________________</h2>
            </h1>
            <p style= {pstyle}>Urban security challenges have intensified due to rising criminal activities, particularly 
            in smaller establishments like convenience stores. Traditional surveillance systems, relying on 
            passive observation and manual reviews, often lead to delays, inaccuracies, and human error. 
            This study aims to develop ThirdVision, a real-time threat detection system that integrates 
            weapon identification using YOLOv8, pose estimation via OpenPose, and a low-cost metal 
            detector sensor. The system focuses on distinguishing between victim and assailant poses to 
            improve threat analysis and minimize false positives. Using a field experimentation approach, 
            ThirdVision is evaluated in a simulated convenience store setting to assess its detection 
            accuracy, response time, and reliability. </p>
        </>
    );
}

export default About;