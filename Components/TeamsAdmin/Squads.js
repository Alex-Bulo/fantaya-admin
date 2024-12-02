import React, { useState, useEffect } from 'react';
import { getPremierePlayers, getSeasonsWithDetails, getTeams, saveSquads, } from '../../callDB';
import './Squads.css'
import Selector from '../Selector';
import { URL } from '../../helper';








const Squads = () => {
    const [selections, setSelections] = useState({
        realTeam:'',
        position:''
    });

    const [allSeasons, setAllSeasons] = useState([])
    const [teams, setTeams] = useState([]);
    
    
    const [allPlayers, setAllPlayers] = useState([]);
    const [allRealTeams, setAllRealTeams] = useState([]);
    const [allPositions, setAllPositions] = useState([
        {id:1,name:'Equipo'}, {id:2,name:'Arq'}, 
        {id:3,name:'Def'}, {id:4,name:'Med'}, 
        {id:5,name:'Del'}
    ])
    
    const [allPlayerChoices, setAllPlayerChoices] = useState([
        {
          id: '',
          name: '',
          position: '',
          realTeam: '',
          realTeamID:'',
          fantayaTeam :''
        }
    ])
    const [filteredPlayerChoices, setFilteredPlayerChoices] = useState([
        {
          id: '',
          name: '',
          position: '',
          realTeam: '',
          realTeamID:'',
          fantayaTeam :''
        }
    ])




    useEffect(()=>{

        const fetchingData = async () => {
            try {
                const seasonsData = await getSeasonsWithDetails()
                setAllSeasons(seasonsData)

                const teamsData = await getTeams(1)
                setTeams(teamsData)

                
                const playersData = await getPremierePlayers()
                setAllPlayers(playersData)
                const premiereTeams = playersData.filter(p => p.position==='Equipo')                
                setAllRealTeams(premiereTeams)

            } catch (error) {
                console.error("Error fetching seasons/teams:", error);
            }
        }
        
        
        fetchingData();

        
    
    },[])


    useEffect(()=>{

        const fetchingData = async () => {
            try {
                const positionOrder = ['Equipo', 'Arq', 'Def', 'Med', 'Del'];

                const sortedPlayersData = allPlayers.sort((a, b) => {
                    // First, compare by realTeam (alphabetically)
                    if (a.realTeam < b.realTeam) return -1;
                    if (a.realTeam > b.realTeam) return 1;

                    // If realTeams are the same, compare by position based on custom order
                    const positionA = positionOrder.indexOf(a.position);
                    const positionB = positionOrder.indexOf(b.position);
                    if (positionA < positionB) return -1;
                    if (positionA > positionB) return 1;

                    // If positions are the same, compare by name (alphabetically)
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;

                    return 0;
                });                
                
                const playersToChoices = sortedPlayersData.map(p =>{
                    
                    const inA = p.squads.length > 0 ? p.squads.find(s=> s.team.division === 'A' ) : []
                    const inB = p.squads.length > 0 ? p.squads.find(s=> s.team.division === 'B' ) : []
                    const inC = p.squads.length > 0 ? p.squads.find(s=> s.team.division === 'C' ) : []
                    const inD = p.squads.length > 0 ? p.squads.find(s=> s.team.division === 'D' ) : []


                    const toChoices = {
                        id: p.id,
                        name: p.name,
                        position: p.position,
                        realTeam: p.realTeam,
                        realTeamID: allPlayers.find(i=> i.fantayaName === p.realTeam || i.name === p.realTeam)?.id || '',
                        fantayaTeam: {
                            A: inA ? inA.team : {id:'', name:''},
                            B: inB ? inB.team : {id:'', name:''},
                            C: inC ? inC.team : {id:'', name:''},
                            D: inD ? inD.team : {id:'', name:''}
                        }
                    }

                    return toChoices

                })
                

                setAllPlayerChoices(playersToChoices)                
                setFilteredPlayerChoices(playersToChoices)                
                

            } catch (error) {
                console.error("Error fetching seasons/teams:", error);
            }
        }
        
        if(allPlayers){
            fetchingData();   
        }

        
    
    },[allPlayers])

    useEffect( ()=>{

        const newFiltered = allPlayerChoices
            .filter(p => selections.realTeam ? p.realTeamID == selections.realTeam : true)
            .filter(p => selections.position ? p.position === allPositions.find(pos=> pos.id==selections.position).name : true)
                
        
        setFilteredPlayerChoices(newFiltered)


    },[allPlayerChoices,selections.realTeam, selections.position])


    const handleSaveSquads = async (division) =>{
        
       
        
        
        const cleanedForDB = allPlayerChoices.map(p =>{

            return {
                idPlayer : p.id,
                idTeam : p.fantayaTeam[division]?.id || ''
            }
        })
        
        const newSquads = await saveSquads(cleanedForDB,division)

        setAllPlayers(newSquads)





    }

    const handleDropDownChange = (playerId, division, teamId) => {
       
        setAllPlayerChoices(prevChoice =>
          prevChoice.map(player => {
              
              if (player.id === playerId) {

                const newFTeam = teams.find(t=>t.id===teamId)?.name || ''
                
              // Update the selected team for the specified division
              const newData = {
                ...player,
                fantayaTeam: {
                  ...player.fantayaTeam,
                  [division]: {id:teamId, name: newFTeam}
                }
              }
              
              return newData
            }

            
            return player;
          })
        );
        setFilteredPlayerChoices(prevChoice =>
          prevChoice.map(player => {
              
              if (player.id === playerId) {

                const newFTeam = teams.find(t=>t.id===teamId)?.name || ''
                
              // Update the selected team for the specified division
              const newData = {
                ...player,
                fantayaTeam: {
                  ...player.fantayaTeam,
                  [division]: {id:teamId, name: newFTeam}
                }
              }
              
              return newData
            }

            
            return player;
          })
        );
      };
    
    return (
        filteredPlayerChoices && 
            <div className="squad-component">
                <div className='squad-selections'>
                    <Selector
                        options={allRealTeams}
                        selectedOption={selections.realTeam}
                        setSelectedOption={(option) => setSelections({...selections, realTeam:option})}
                        defOption='Todos los Equipos'
                    />
                    <Selector
                        options={allPositions}
                        selectedOption={selections.position}
                        setSelectedOption={(option) => setSelections({...selections, position:option})}
                        defOption='Todas las Posiciones'
                    />
                </div>
                
                
                
                    <table className='squad-table'>
                        <thead className='squad-header-container'>
                            <tr className='squad-header-save'>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className='squad-division-column'><button className='save-division' onClick={()=>handleSaveSquads('A')}>Guardar A</button></td>
                                <td className='squad-division-column'><button className='save-division' onClick={()=>handleSaveSquads('B')}>Guardar B</button></td>
                                <td className='squad-division-column'><button className='save-division' onClick={()=>handleSaveSquads('C')}>Guardar C</button></td>
                                <td className='squad-division-column'><button className='save-division' onClick={()=>handleSaveSquads('D')}>Guardar D</button></td>
                            </tr>
                            <tr className='squad-headers'>
                                <th>Equipo</th>
                                <th>Jugador</th>
                                <th>Posición</th>
                                <th className='squad-division-coslumn'>Primera A</th>
                                <th className='squad-division-colsumn'>Nacional B</th>
                                <th className='squad-division-colusmn'>Federal C</th>
                                <th className='squad-division-columsn'>Regional D</th>
                            </tr>
                        </thead>

                        <tbody className='squad-info'>
                            {filteredPlayerChoices.map(player => {
                                const playerPic = `${URL}players/${player.realTeamID}.png`
                                
                            return (
                            <tr key={player.id} className='squad-info-row'>
                                <td>
                                    <img 
                                        src={playerPic || `${URL}TeamsLogos/genericPlayer.png`} 
                                        className='realTeam-pic'
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = `${URL}players/genericPlayer.png`;
                                        }}
                                    />
                                </td>
                                <td>{player.name}</td>
                                <td>{player.position}</td>

                                {['A', 'B', 'C', 'D'].map(division => (
                                <td key={division} className='squad-division-column'>
                                    <select
                                        value={player.fantayaTeam[division]?.id || ''}
                                        onChange={e => handleDropDownChange(player.id, division, parseInt(e.target.value))}
                                        className={player.fantayaTeam[division]?.id && 'picked'}
                                    >
                                    <option value="">Elegir Equipo</option>
                                    {teams.filter(team=>team.division===division).map(team => (
                                        <option key={team.id} value={team.id}>
                                        {team.name}
                                        </option>
                                    ))}
                                    </select>
                                </td>
                                ))}

                            </tr>
                            )}
                            )}
                        </tbody>
                    </table>

            </div>
        
    );
};

export default Squads;
