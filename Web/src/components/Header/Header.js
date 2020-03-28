import React, { Component } from "react";
import { NavLink } from "react-router-dom";
class Header extends Component {
    render() {
        return (
            <div className="header">
                <h1 className="title">UK Police Data</h1>
            </div>
        )
    }
}

export default Header;