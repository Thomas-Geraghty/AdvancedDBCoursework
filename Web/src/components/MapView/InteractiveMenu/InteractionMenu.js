import React from "react";
import { MainContext } from '../MainContext';
import { PublicTransportContext } from '../PublicTransportContext';
import ArrivalList from './ArrivalList/ArrivalList'
import ServiceList from './ServiceList/ServiceList'
import './InteractionMenu.scss'

export default function InteractionMenu() {
    const { ptState, ptDispatch } = React.useContext(PublicTransportContext);

    return (
        <div className={`InteractionMenu ${ptState.activeStopID ? 'active' : ""}`}>
            <div className="InteractionMenu__search-bar"></div>
            {
                ptState.activeStopID !== null && ptState.data !== null ?
                    <div className="InteractionMenu__insight">
                        <h3 className="InteractionMenu__insight--title">{`${ptState.data.name} ${ptState.data.indicator}`}</h3>
                        <ServiceList />
                        <ArrivalList />
                    </div>
                : null
            }
        </div>
    )
}