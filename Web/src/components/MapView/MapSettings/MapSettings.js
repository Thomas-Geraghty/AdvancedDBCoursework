import React, { useEffect } from "react";
import "./MapSettings.scss";
import { CrimeDataContext } from '../CrimeDataContext';

const d = new Date(); 

export default function MapSearch() {
    const { cState, cDispatch } = React.useContext(CrimeDataContext);
    const [ active, setActive ] = React.useState(false);
    const [ settings, setSettings ] = React.useState({
        dateStart: dateFormatter(d),
        dateEnd: dateFormatter(new Date()),
        crimeType: 'All'
    });

    const crime_options = cState.crime_types.map(type => {
        return <option value={type}>{type}</option>
    })

    function dateFormatter(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd; }
        if (mm < 10) { mm = '0' + mm; }
        return `${yyyy}-${mm}-${dd}`;
    }

    function updateSettings(setting, value) {
        console.log(`${setting} : ${value}`)
        const newSettings = settings;
        newSettings[setting] = value;
        setSettings(newSettings);
    }

    // Render
    return (
        console.log(settings),

        <div className={`map-settings ${ active ? "active" : "" }`}>
            <button className="button button--square button--color-1" onClick={() => { active ? setActive(false) : setActive(true) }}>
                <i className="fa fa-gear"></i>
            </button>
            <div className="map-settings__slide-out">
                <form>
                    <div className="map-settings__date-selector">
                        <h4>Date</h4>
                        {console.log(settings.dateEnd)}
                        <input type="date" name="date-start" value={settings.dateStart}
                            onChange={(e) => { updateSettings('dateStart', e.target.value) }}>
                        </input>
                        <p>to</p>
                        <input type="date" name="date-end" value={settings.dateEnd}
                            onChange={(e) => { updateSettings('dateEnd', e.target.value) }}>
                        </input>
                    </div>

                    <div className="map-settings__crime-selector">
                        <h4>Crime Type</h4>
                        <select name="crime-type" value={settings.crimeType}>
                            {crime_options}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
}
