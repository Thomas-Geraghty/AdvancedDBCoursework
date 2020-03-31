import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import MapView from "./MapView/MapView";
import ChartView from "./ChartView/ChartView";
import '../styles/Main.scss';


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