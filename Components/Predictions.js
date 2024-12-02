import React from 'react';
import {  Legend, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import './Predictions.css';

function Predictions({predictions}) {


  const renderLegend = (props) => {
    const { payload } = props;
    const metrics = payload.map(item => item.payload.metric)
    const uniqueMetrics = [...new Set(metrics)]
    
    const colorOrder = ['#ff4d4f','#696969','#ff4d4f','#696969']


    return (
      <ul className='pieLegend'>
        {
          uniqueMetrics.map((entry, index) => (
            <li key={`item-${index}`} style={{color:colorOrder[index]}}>{entry}</li>
          ))
        }
      </ul>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    console.log(payload);
    
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.metric}</p>
          <p className="tooltip-detail">{payload[0].payload.name}: {payload[0].payload.value}%</p>
        </div>
      );
    }
  
    return null;
  };



  return (  

    <div className='predictionStats'>
        <ResponsiveContainer className='radarChart'width="100%" height={400}>
        <RadarChart outerRadius={90} width={730} height={250} data={predictions.radar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <Radar name={predictions.fixture.home.name} dataKey="home" stroke="#d32f2f" fill="#f44336" fillOpacity={0.5} />
            <Radar name={predictions.fixture.away.name} dataKey="away" stroke="#444" fill="#848484" fillOpacity={0.5} />
            <Legend verticalAlign='top' align='right' className='hola'/>
        </RadarChart>
        </ResponsiveContainer>

        <ResponsiveContainer className='pieChart' width="100%" height={400}>
        <PieChart width={400} height={400}>
            <Pie data={predictions.pieChart.victoria} dataKey="value" innerRadius={0} outerRadius={20} fill="#82ca9d"/>
            <Pie data={predictions.pieChart.forma} dataKey="value" innerRadius={30} outerRadius={45} fill="#8884d8" />
            <Pie data={predictions.pieChart.h2h} dataKey="value" innerRadius={50} outerRadius={65} fill="#82ca9d"/>
            <Pie data={predictions.pieChart.eXGoal} dataKey="value" innerRadius={70} outerRadius={85} fill="#82ca9d"/>
            <Legend content={renderLegend} align='center'/>
            <Tooltip content={<CustomTooltip />}/>
        </PieChart>
        </ResponsiveContainer>

    </div>
    

  
  );
}

export default Predictions;
