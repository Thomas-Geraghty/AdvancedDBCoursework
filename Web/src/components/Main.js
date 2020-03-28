import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";
import '../styles/Main.scss';
import '../client/Main.js';

import Header from "./Header/Header.js"
import Footer from "./Footer/Footer.js"
import MapView from "./MapView/MapView.js";

class Main extends Component {
    render() {
        return (
            <HashRouter>
                <Header />
                <div className="content">
                    <MapView />
                </div>
                <Footer />
            </HashRouter>
        );
    }
}

export default Main;