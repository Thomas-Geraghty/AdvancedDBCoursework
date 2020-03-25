import React, { Component } from "react";
import { NavLink } from "react-router-dom";
class Header extends Component {
    render() {
        return (
            <div className="header">
                <h1 className="title">Public Transport SPA</h1>
                <nav>
                    <NavLink to="/map">Map</NavLink>
                    <NavLink to="/list">List</NavLink>
                </nav>
            </div>
        )
    }
}

export default Header;