import React, { useEffect } from "react";
import { PublicTransportContext } from '../../PublicTransportContext';
import './ArrivalList.scss'

// Arrival list/table
export default function ArrivalList() {
    const { ptState } = React.useContext(PublicTransportContext);

    function createArrivalItems() {
        // Gets arrival arrays and combines them into one.
        const arrivals = ptState.data.services.map(service => { return [...service.arrivals]}).reduce((flat, next) => flat.concat(next), [])
        // Sets arrivalTime attr
        arrivals.map(arrival => arrival.arrivalTime = (arrival.expectedTime ? arrival.expectedTime : arrival.scheduledTime));
        // Sorts by arrivalTime attr
        arrivals.sort((a, b) => { return a.arrivalTime - b.arrivalTime });

        return arrivals.map(arrival => {
            return <ArrivalListItem id={arrival.id} arrivalTime={arrival.arrivalTime} scheduledTime={arrival.scheduledTime}/>
        })
    }

    return (
        <div className="arrivals__list">
            <h4 className="arrivals__list--title">Arrivals</h4>
            {ptState.data.services ?
                <table className="arrivals__list--table">
                    <thead>
                        <tr className="arrivals__list--table-head">
                            <th>Exp.</th>
                            <th>Route</th>
                            <th>Dest.</th>
                            <th>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {createArrivalItems()}
                    </tbody>
                </table>
                : <p>No arrival data available</p>
            }
        </div>
    )
}

// Arrival table/list items
function ArrivalListItem(props) {
    const { ptState, ptDispatch } = React.useContext(PublicTransportContext);
    const [ service ] = React.useState(ptState.data.services.find(service => service.id == props.id));
    const [ time, setTime ] = React.useState(Date.now());

    useEffect(() => {
        let interval;
        if (props.arrivalTime - time) {
            interval = setInterval(() => {
                setTime(Date.now());
            }, 20000);
        } else {
            clearInterval(interval)
        }
    }, []);

    function onClick() {
        if(service.id !== ptState.activeServiceID) {
            ptDispatch({ type: 'SET_ACTIVE_SERVICE_ID', payload: service.id })
        } else {
            ptDispatch({ type: 'SET_ACTIVE_SERVICE_ID', payload: null })
        }
    }

    if (props.arrivalTime - time > 0) {
        return (
            <tr className={service.id === ptState.activeServiceID && 'active'} onClick={() => { onClick() }} >
                <td>{getTimeTillRepresentation(props.arrivalTime)}</td>
                <td style={{color: service.color}}>{service.name}</td>
                <td>{service.routes[0].destination}</td>
                <td>{props.arrivalTime - props.scheduledTime > 0 ? <span>{Math.floor((props.arrivalTime - props.scheduledTime) / 60000)}min delay</span> : <span>On time</span>}</td>
            </tr>
        )
    } else {
        return null
    }
}

function getTimeTillRepresentation(arrivalTime) {
    function pad(n) { return ("0" + n).slice(-2); }

    var timeInMins = Math.floor((arrivalTime - Date.now()) / 60000);
    var time = new Date(arrivalTime)

    if (timeInMins >= 60) {
        return `${pad(time.getHours())}:${pad(time.getMinutes())}`
    } else if (timeInMins === 1) {
        return `${timeInMins}min`
    } else if (timeInMins === 0) {
        return 'due'
    } else {
        return `${timeInMins}mins`
    }
}