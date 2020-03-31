import React, { useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getCrimeStats } from '../../client/API';
import './ChartView.scss'

const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
    }]
};

const options = {
    legend: {
        display: false,
    },
};

export default function ChartView() {
    const [ stats, setStats ] = React.useState([]);

    useEffect(() => {
        getCrimeStats('all').then(result => {
            setStats(result);
            console.log(result)
        })
    }, [])

    function createCrimesByType() {
        if(stats.crimesByType) {
            let dataset = stats.crimesByType;
            let labels = dataset.map(stat => stat._id);
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crimes Per Type',
                    data: values,
                    backgroundColor: colors
                }]
            }

            return <Doughnut data={data} options={options}/>
        }
    }

    function createCrimesByRegion() {
        if(stats.crimesByType) {
            let dataset = stats.crimesByRegion;
            let labels = dataset.map(stat => stat._id);
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crimes Per Policing Region',
                    data: values,
                    backgroundColor: colors
                    
                }]
            }

            return <Doughnut data={data} options={options}/>
        }
    }

    // Render
    return (
        <div className="ChartView">
            <h3>Charts</h3>
            <div className="charts-row">
                <div>
                    <h4>Crimes by Type</h4>
                    {createCrimesByType()}
                </div>
                <div>
                    <h4>Crimes by Policing Region</h4>
                    {createCrimesByRegion()}
                </div>
            </div>
        </div>
    )
}

var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }