import React, { useEffect, useState } from 'react';

import './Fixture.css';
import PlayerInfo from './PlayerInfo';
import { iconDictionary as icon } from '../../helper';




function Fixture({matches, fantayaSetter}) {

  const [date, setDate] = useState('')
//   const [matches, setMatches] = useState([])

  const [statsToShow, setStatsToShow] = useState([])
  const [infoToShow, setInfoToShow] = useState(null)
  const [fixture, setFixtures] = useState(null)
    
  useEffect(()=>{
    
    if(matches){

      
        let fixtureStructure = []

        matches.fantayaInfo.forEach( (match,i) =>{
            const consolidatedFixture = {
                fantayaStats: {stats:match, fixtureId:matches.fixtureInfo[i].fixture.id},
                realFixture: matches.fixtureInfo[i],
                fixtureKey: {
                    id: matches.fixtureInfo[i].fixture.id,
                    date: matches.fixtureInfo[i].fixture.date,
                    status: matches.fixtureInfo[i].fixture.status.long,
                    venue: matches.fixtureInfo[i].fixture.venue.city + ', ' + matches.fixtureInfo[i].fixture.venue.name + ' (' + matches.fixtureInfo[i].teams.home.name +')',
                    fixtureTeams: `${matches.fixtureInfo[i].teams.home.name} ${matches.fixtureInfo[i].fixture.status.short==='FT' ? matches.fixtureInfo[i].goals.home:''} vs ${matches.fixtureInfo[i].teams.away.name} ${matches.fixtureInfo[i].fixture.status.short==='FT' ? matches.fixtureInfo[i].goals.away : ''}`
                }
            }
            fixtureStructure.push(consolidatedFixture)
        })
        
        setFixtures(fixtureStructure)
        setStatsToShow(fixtureStructure.map(f=>f.fantayaStats))
        

    } 

  },[matches])

  const handlePlayerClick = (id) =>{
    setInfoToShow(null)
    
    const playerInMatch = statsToShow
        .flatMap(match => [...match.stats[0], ...match.stats[1]])
        .find(player => player.id === id);


    if(playerInMatch){
      setInfoToShow(playerInMatch)
    }     

  }

  const handleClosePopUp = () =>{
    setInfoToShow(null)
  }


  return (  

    <div className="FixtureContainer">
        
        { infoToShow &&
            <PlayerInfo data={infoToShow} fantayaSetter={fantayaSetter} onClose={handleClosePopUp}/>
        }

    <div className="fixture-fantayaStats">
        {statsToShow &&
          statsToShow.map((f, i) => {
            
            const realMatchInfo = fixture[i].fixtureKey;
            const positionOrder = ['Equipo', 'Arq', 'Def', 'Med', 'Del'];

            // Sort stats for each team by the defined position order
            const sortedStats = f.stats.map(subArray =>
              subArray.sort(
                (a, b) =>
                  positionOrder.indexOf(a.playerPosition) - positionOrder.indexOf(b.playerPosition)
              )
            );
            const filterSortedStats = sortedStats.map(s => s.filter(player => player.minutosJugadosApi > 0));

            // Calculate the maximum length to cover both teams
            const maxPlayers = Math.max(filterSortedStats[0].length, filterSortedStats[1].length);
            
            return (
              <div className="premiere-tables-container" key={f.fixtureId}>
                <div className="match-header">
                  <h3 className="match-name">{realMatchInfo.fixtureTeams}</h3>
                  <h5 className="match-venue">{realMatchInfo.venue}</h5>
                </div>

                <table className="premiere-match">
                  <thead>
                    <tr>
                      <th className="team-header">
                        <img className='team-logo' src={`https://media.api-sports.io/football/teams/${fixture[i].realFixture.teams.home.id}.png`} />
                        {fixture[i].realFixture.teams.home.name}
                      </th>
                      <th className="team-header">
                        {fixture[i].realFixture.teams.away.name}
                        <img className='team-logo' src={`https://media.api-sports.io/football/teams/${fixture[i].realFixture.teams.away.id}.png`} />
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from({ length: maxPlayers }).map((_, idx) => (
                      <tr key={idx} className="premiere-player-stat">
                        {/* Team A - Left Side */}
                        <td className="team-info">
                          {filterSortedStats[0][idx] && filterSortedStats[0][idx].minutosJugadosApi > 0 ? (
                            <div className="player-info" onClick={() => handlePlayerClick(filterSortedStats[0][idx].id)} >
                              <div className='player-detail'>
                                {(filterSortedStats[0][idx].figura !==0 && filterSortedStats[0][idx].figura) && (
                                  <i className={`${icon.figura} myIcon`}/> 
                                )}
                                {(filterSortedStats[0][idx].liderPases !==0 && filterSortedStats[0][idx].liderPases) && (
                                  <i className={`${icon.liderPases} myIcon`}/> 
                                )}
                                <span className="playername">{filterSortedStats[0][idx].jugador}</span>
                                <span className="description">{filterSortedStats[0][idx].FPDescripcion}</span>
                              </div>
                              <span className="fantapoints">{filterSortedStats[0][idx].fantapuntos}</span>

                            </div>
                          ) : null}
                        </td>

                        {/* Team B - Right Side */}
                        <td className="team-info">
                          {filterSortedStats[1][idx] && filterSortedStats[1][idx].minutosJugadosApi > 0 ? (
                            <div className="player-info" onClick={() => handlePlayerClick(filterSortedStats[1][idx].id)}>
                              <span className="fantapoints">{filterSortedStats[1][idx].fantapuntos}</span>
  
                              <div className='player-detail'>
                              {(filterSortedStats[1][idx].figura !==0 && filterSortedStats[1][idx].figura) && (
                                    <i className={`${icon.figura} myIcon`}/>
                                  )}
                              {(filterSortedStats[1][idx].liderPases !==0 && filterSortedStats[1][idx].liderPases) && (
                                    <i className={`${icon.liderPases} myIcon`}/>
                                  )}
                                <span className="playername">{filterSortedStats[1][idx].jugador}</span>
                                <span className="description">{filterSortedStats[1][idx].FPDescripcion}</span>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
      </div>


    
    </div>

  
  );
}

export default Fixture;
