import React, { useState, useEffect } from 'react';

import './PointsCalculator.css';
import { getAllMatches, getPlayersInfo, getPredictionsInfo } from '../../callApis.js';

import {saveAs} from "file-saver"
import XLSX from "sheetjs-style"
import { FP_CalculateAllPoints, predictionManipulation_Radar, replaceObjectById } from '../../dataManipulation.js';
import Predictions from '../Predictions.js';
import Fixture from './Fixture.js';
import { getFixture, getSeasonsWithDetails, savePlayersEvents } from '../../callDB.js';
import SeasonFixtureFilters from '../SeasonFixtureFilters.js';
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

function PointsCalculator() {
  // States for SeasonFixtureFiltures
  const [selections, setSelections] = useState({
    fixture: '',
    season:''
  })
  const [allSeasons, setAllSeasons] = useState([])
  const [fixtures, setFixtures] = useState([])


  // State to store the selected date
  const [dummyState, setDummyState] = useState(0);
  const [date, setDate] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedMatches, setSelectedMatches] = useState([])
  const [infoMatches, setInfoMatches] = useState(null)
  const [fantayaStats, setFantayaStats] = useState([])
  const [predictions, setPredictions] = useState(null)



  useEffect(()=>{
    const fetchData = async () => {
        try {

            // modificar para cambiar el fixture dependiendo season que quiera el usuario
            const seasonsData = await getSeasonsWithDetails()

            setAllSeasons(seasonsData)
                            

        } catch (error) {
            console.error("Error fetching fixtures:", error);
        }
    };
    
    
    fetchData();



},[])

useEffect(()=>{
    const fetchData = async () => {
        try {

            const fixturesData = await getFixture(selections.season)
            
            
            setFixtures(fixturesData)
                            

        } catch (error) {
            console.error("Error fetching fixtures:", error);
        }
    };
    
    if(selections.season){

        fetchData();
    }

},[selections.season])



  const handleMatchSelect = (matchId) => {
    setSelectedMatches((prevSelected) => 
      prevSelected.includes(matchId)
        ? prevSelected.filter(id => id !== matchId) // Remove if already selected
        : [...prevSelected, matchId] // Add if not selected
    );
  };

  const handleDateChange = (event) => {
    setDate(event.target.value); // Update state with the selected date
  };


  const getMatches = async ()=>{
    const allMatches = await getAllMatches(date)

    setMatches(allMatches)
  }

  const handleConfirm = async () => {
    const allPlayers = []
    fantayaStats.forEach(match => allPlayers.push(...match[0],...match[1]))
    const db = await savePlayersEvents(allPlayers,selections.fixture)
    
    exportToExcel(allPlayers, date )
    setSelectedMatches([])


  }


  const handleUserEdits = (playerData) =>{
    
    const newStats = FP_CalculateAllPoints(playerData)
    
    const updatedStats = fantayaStats
    
    const consolidatedNewStat = {...playerData, ...newStats[0], ...newStats[1]}

    replaceObjectById(updatedStats, consolidatedNewStat)    

    setFantayaStats(updatedStats)
    setDummyState(dummyState+1)

  }

  const handleView = async ()=>{
    const infoByTeamsWithinMatch = await getPlayersInfo(selectedMatches)
    
    console.log('Requests Remaining: ', infoByTeamsWithinMatch.apiRemaining);
    
    setInfoMatches({fixtureInfo: infoByTeamsWithinMatch.fixtureInfo, fantayaInfo:infoByTeamsWithinMatch.fantayaInfo})
    setFantayaStats(infoByTeamsWithinMatch.fantayaInfo)

  }

  const handlePredictions = async () => {

    const allPredictions = await getPredictionsInfo(selectedMatches)
    const predictionRadar = predictionManipulation_Radar(allPredictions[0])

    setPredictions(predictionRadar)
    setSelectedMatches([])    
  }


  const exportToExcel = async (fixtureData,matchDate) => {
    
    const ws = XLSX.utils.json_to_sheet(fixtureData)
    const wb = { Sheets: {'data': ws}, SheetNames:['data']}
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type:'array'})
    const data = new Blob([excelBuffer], {type: fileType})
    saveAs(data, matchDate+' Export - ' + date + '.xlsx')
}


  return (  
      <div className='main-component'>
        {fixtures && 
                <SeasonFixtureFilters 
                    fixtures={fixtures}
                    // teams={teams}
                    seasons={allSeasons}
                    selections={selections}
                    setSelections={setSelections}
                />
          }

        <div className="fantaya">
    
          <div className='fecha-input'>
              <h1>Ingresar Fecha</h1>

              <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="date-input"
              />
          </div>
          
              <button onClick={getMatches} className='search-button'>
                  Buscar Partidos
              </button>

              <div className='info'>
                  <div className='matches'>
                      {matches && matches.map(match => (
                          <div
                              key={match.id}
                              className={`match ${selectedMatches.includes(match.id) ? 'selected' : ''}`}
                              onClick={() => handleMatchSelect(match.id)}
                          >
                              <div className="home-away-info">
                                  <strong className="team">{match.home} </strong>
                                  
                                  <div className="scores">
                                      {match.homeGoals} - {match.awayGoals}
                                  </div>
                                  
                                  <strong className="team"> {match.away}</strong>
                              </div>
                              {selectedMatches.includes(match.id) && <div className="selected-overlay">✓</div>}
                      </div>
                ))}

              </div>

              <div className='button-section'>
                  <button onClick={handleView} disabled={selectedMatches.length === 0} className='action-button'>
                      Ver Info
                  </button>
              
                  <button onClick={handleConfirm} disabled={fantayaStats.length === 0} className='action-button'>
                      Guardar y Exportar
                  </button>
      
                  {/* <button onClick={handlePredictions} disabled={selectedMatches.length === 0} className='action-button'>
                      Obtener Predicciones
                  </button> */}
              </div>


              </div>

          {/* {predictions && 
              <Predictions predictions={predictions}/>
          } */}
        </div>

        {infoMatches &&
            <Fixture matches={infoMatches} fantayaSetter={handleUserEdits}/>
        }


      </div>

  );
}

export default PointsCalculator;
