import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import '../styles/Main.scss';
import '../client/Main.js';

import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import MapView from "./MapView/MapView";
import ChartView from "./ChartView/ChartView";


class Main extends Component {
    render() {
        return (
            <HashRouter>
                <Header key="header" />
                <div className="content" key="content">
                    <Route exact path="/" component={MapView} />
                    <Route exact path="/charts" component={ChartView} />
                </div>
                <Footer key="footer" />
            </HashRouter>
        );
    }
}

export default Main;