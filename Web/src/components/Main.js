import React, { Component } from "react";
import '../styles/Main.scss';
import '../client/Main.js';

import Header from "./Header/Header.js"
import Footer from "./Footer/Footer.js"
import MapView from "./MapView/MapView.js";

class Main extends Component {
    render() {
        return (
            [
            <Header key="header"/>,
            <div className="content" key="content">
                <MapView />
            </div>,
            <Footer key="footer"/>
            ]
        );
    }
}

export default Main;