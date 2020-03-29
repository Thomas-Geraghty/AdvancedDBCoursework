import React from "react";
import "./MapSettings.scss";
import { MainContext } from '../MainContext';

export default function MapSearch() {
    const [ active, setActive ] = React.useState(false);

    // Render
    return (
        <div className={`map-settings ${ active ? "active" : "" }`}>
            <button className="button button--square button--color-1" onClick={() => { active ? setActive(false) : setActive(true) }}>
                <i className="fa fa-gear"></i>
            </button>
            <div className="map-settings__slide-out">
                <div className="map-settings__date-selector">
                    <h4>Date</h4>
                    <input type="date"></input>
                    <p>to</p>
                    <input type="date"></input>
                </div>

                <div className="map-settings__crime-selector">
                    <h4>Crime Type</h4>
                    <select>
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="fiat">Fiat</option>
                        <option value="audi">Audi</option>
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="fiat">Fiat</option>
                        <option value="audi">Audi</option>
                    </select>
                </div>
            </div>
        </div>
    )
}