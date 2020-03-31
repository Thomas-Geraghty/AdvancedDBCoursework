import React, { useEffect } from "react";
import "./MapSettings.scss";
import { CrimeDataContext } from '../CrimeDataContext';

const d = new Date(); 

export default function MapSearch() {
    const { cState, cDispatch } = React.useContext(CrimeDataContext);
    const [ active, setActive ] = React.useState(false);
    const [ dateEnd, setDateEnd ] = React.useState(dateFormatter(new Date() ));
    const [ dateStart, setDateStart] = React.useState(dateFormatter(new Date(d.setMonth(d.getMonth() - 3))));
    const [ crimeType, setCrimeType] = React.useState('All');

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

    useEffect(() => {
        cDispatch({ type: 'SET_MAP_SETTINGS', payload: { dateEnd: dateEnd, dateStart: dateStart, crimeType: crimeType } })
    }, [dateEnd, dateStart, crimeType])

    // Render
    return (
        <div className={`map-settings ${ active ? "active" : "" }`}>
            <button className="button button--square button--color-1" onClick={() => { active ? setActive(false) : setActive(true) }}>
                <i className="fa fa-gear"></i>
            </button>
            <div className="map-settings__slide-out">
                <form>
                    <div className="map-settings__date-selector">
                        <h4>Date</h4>
                        <input type="date" name="date-start" value={dateStart}
                            onChange={(e) => { setDateStart(e.target.value) }}>
                        </input>
                        <p>to</p>
                        <input type="date" name="date-end" value={dateEnd}
                            onChange={(e) => { setDateEnd(e.target.value) }}>
                        </input>
                    </div>

                    <div className="map-settings__crime-selector">
                        <h4>Crime Type</h4>
                        <select name="crime-type" value={crimeType}
                        onChange={(e) => { setCrimeType(e.target.value) }}>>
                            {crime_options}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
}
