import React, { useState, useEffect } from 'react';
import { getSeasonsWithDetails, getStandingByFixture } from '../../callDB';
import './FreePick.css'
import Selector from '../Selector';
import { addMinutesToDate, formatDate_DayNumTime, groupByProperty, sortByLastDate, URL } from '../../helper';








const FreePick = () => {
    const [selections, setSelections] = useState({
        season:'',
        fixture:'',
        relatedSeason:'',
        newOrder:'',
        firstPicks:{
            A:[],
            B:[],
            C:[],
            D:[]
        },
        secondPicks:{
            A:[],
            B:[],
            C:[],
            D:[]
        }
    });

    const [allSeasons, setAllSeasons] = useState([])
    const [selectedSeason, setSelectedSeason] = useState(null)
    
    const [sortedPick, setSortedPick] = useState(null)
    const [relatedStandings, setRelatedStandings] = useState(null)
    
    const [popUpTeam, setPopUpTeam] = useState(null)


    const handleOutsideClick = (e) => {
        if (e.target.classList.contains('popup-overlay')) {
            closePopup();
        }
    };


    useEffect(()=>{

        const fetchingData = async () => {
            try {
                const seasonsData = await getSeasonsWithDetails()
                setAllSeasons(seasonsData)
                setAllSeasons(seasonsData)                
                

            } catch (error) {
                console.error("Error fetching seasons/teams:", error);
            }
        }
        
        
        fetchingData();

        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };

        
    
    },[])


    useEffect(()=>{     
        
        if(selections.season){
            
            const newSelectedSeason = allSeasons.find(s => s.id == selections.season)
            setSelectedSeason(newSelectedSeason)             
        }

        
    
    },[selections.season])

    useEffect( ()=>{
        const fetchingData = async () => {
            try {
                
                const standingData = await getStandingByFixture(selections.relatedSeason)
                const pointsByTeam = standingData.standings.map(team =>{

                    const teamInfo = {
                        id: team.id,
                        name: team.name,
                        points: team.standings.reduce( (acc, st) => acc + st.totalPoints,0),
                        scored: team.standings.reduce( (acc, st) => acc + st.scored,0),
                        received: team.standings.reduce( (acc, st) => acc + st.received,0) 
                    }
                    return teamInfo

                })
            


                setRelatedStandings(pointsByTeam)
                
                
                
                const matchesInSelectedFixture = selectedSeason.fixture
                            .find(f => f.id == selections.fixture)
                            .matches.map(m => {

                                const homeIndex = pointsByTeam.findIndex(relatedSeasonTeam => relatedSeasonTeam.id === m.idTeamHome);
                                const awayIndex = pointsByTeam.findIndex(relatedSeasonTeam => relatedSeasonTeam.id === m.idTeamAway);
                                const foundHome = pointsByTeam[homeIndex];
                                const foundAway = pointsByTeam[awayIndex];
                            
                                const teamA ={
                                    id: m.idTeamHome,
                                    name: m.teamHome.name,
                                    division: m.teamHome.division,
                                    lastScore: m.homeScore,
                                    ...foundHome,
                                }
                                const teamB ={
                                    id: m.idTeamAway,
                                    name: m.teamAway.name,
                                    division: m.teamAway.division,
                                    lastScore: m.awayScore,
                                    ...foundAway,
                                }
                                return [teamA,teamB]
                            }).flat()

            
                            
                        const groupedAndSortedData = groupByProperty(matchesInSelectedFixture,'division')
                        
                        Object.entries(groupedAndSortedData).forEach( ([division,values]) => {
                            
                            const relatedRankings = [...groupedAndSortedData[division]].sort((a, b) => {
                                // Sort by points (ascending)
                                if (a.points !== b.points) return a.points - b.points;
                                // If points are the same, sort by scored (ascending)
                                if (a.scored !== b.scored) return a.scored - b.scored;
                                // If points and scored are the same, sort by received (descending)
                                return b.received - a.received;
                            })

                            groupedAndSortedData[division].forEach(team => {

                                const ranking = relatedRankings.findIndex(relatedSeasonTeam => relatedSeasonTeam.id === team.id);
                                
                                team.relatedRanking = ranking+1
                            })


                            groupedAndSortedData[division].sort((a, b) => {
                                    // Sort by scored last match (ascending)
                                    if (a.lastScore !== b.lastScore) return a.lastScore - b.lastScore;
                                    // Sort by ranking (ascending)
                                    return b.relatedRanking - a.relatedRanking;
                                })
                            
                            
                            
                        })

                setSortedPick(groupedAndSortedData)
                
                
                
            } catch (error) {
                console.error("Error fetching seasons/teams:", error);
            }
        }


        

        
        
        
        
        if(selections.fixture && selections.relatedSeason){
            fetchingData()
        }



    },[selections.fixture, selections.relatedSeason ])

    const handleDatePicker = (date, division,order) =>{
        const newFirstPick = date.target.value

        const newPicks = order===1 ? {...selections.firstPicks} : {...selections.secondPicks}

        newPicks[division] = sortedPick[division].map((_,idx) =>{
            const dateToUse = addMinutesToDate(newFirstPick, 30 * idx)
            return formatDate_DayNumTime(dateToUse)
        })
        
        
        setSelections(order===1 ? {...selections, firstPicks:newPicks} : {...selections, secondPicks:newPicks})

    }

    const handleSaveOrder = (division, originalOrder)=>{
        function moveItem(array, currentIndex, newIndex) {
            if (newIndex >= array.length || newIndex < 0) {
              console.error("New index is out of bounds");
              return array;
            }
          
            const updatedArray = [...array]; // Create a shallow copy to avoid mutating the original array
            const [movedItem] = updatedArray.splice(currentIndex, 1); // Remove the item at `currentIndex`
            updatedArray.splice(newIndex, 0, movedItem); // Insert the item at `newIndex`
            return updatedArray;
          }
          const originalIdx = originalOrder - 1
          const newIdx = Number(selections.newOrder) -1

          const newOrder = moveItem(sortedPick[division],originalIdx, newIdx)
          
          setSortedPick({...sortedPick, [division]:newOrder})
          
          setSelections({...selections,newOrder:''})
          setPopUpTeam(null)
          
        }
        
    const handleTeamClick =(team, idx)=>{
            
        setSelections({...selections,newOrder:idx+1})
        setPopUpTeam({...team, order:idx+1})

    }
    const closePopup = ()=>{
        setPopUpTeam(null)
        
    }


    
    return (
        allSeasons && 
            <div className="pick-component">
                <div className='squad-selections'>
                    <Selector
                        options={allSeasons.map(s =>{ return{id:s.id,name:s.name} }) }
                        selectedOption={selections.season}
                        setSelectedOption={(option) => setSelections({...selections, season:option})}
                        defOption='Elegir Temporada'
                    />
                    { selectedSeason &&
                    <>
                        <Selector
                            options={selectedSeason.fixture.map(f=>{ return {id:f.id,name:`Fecha ${f.fantayaFecha} (${f.endDate})`} }) }
                            selectedOption={selections.fixture}
                            setSelectedOption={(option) => setSelections({...selections, fixture:option})}
                            defOption='Elegir Fecha'
                        />
    
                        <Selector
                            options={allSeasons.map(s =>{ return{id:s.id,name:s.name} }) }
                            selectedOption={selections.relatedSeason}
                            setSelectedOption={(option) => setSelections({...selections, relatedSeason:option})}
                            defOption='Temporada para desempate'
                        />
                    </>
                    }

                </div>
                
                
                { sortedPick &&
                    Object.entries(sortedPick).sort((a,b)=> a[0].localeCompare(b[0])).map(([division,teams]) => 
                            <div className='pick-division-container'>
                                <h4 className='pick-division top-header'>Categoria {division}</h4>
                                <table className='pick-table'>
                                    <thead className='pick-header-container'>
                                        <tr className='pick-headers-dates'>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                <input 
                                                    type='datetime-local' 
                                                    className='' 
                                                    value={selections.firstPicks[0]} 
                                                    onChange={(e)=> handleDatePicker(e,division,1)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type='datetime-local' 
                                                    className='' 
                                                    value={selections.secondPicks[0]} 
                                                    onChange={(e)=> handleDatePicker(e,division,2)}
                                                />
                                            </td>
                                            <td></td>
                                        </tr>

                                        <tr className='pick-headers'>
                                            <th>Orden</th>
                                            <th>Equipo</th>
                                            <th>Libre 1</th>
                                            <th>Libre 2</th>
                                            <th>FP | Pos</th>
                                        </tr>
                                    </thead>

                                    <tbody className='pick-info'>
                                        {   teams.map( (team, idx) =>{

                                                return(
                                                    <tr key={idx} className='pick-info-row' onClick={()=>handleTeamClick(team,idx)}>
                                                        <td className=''>
                                                            {idx + 1}
                                                        </td>
                                                        <td className=''>
                                                            <div className='pick-team-info'>
                                                                <img 
                                                                    className='pick-team-pic' 
                                                                    src={`${URL}TeamsLogos/${team.id}.png`} 
                                                                    onError={(e) => {
                                                                        e.target.onerror = null; // Prevent infinite loop
                                                                        e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                                                    }}
                                                                />                                                
                                                                <h5 className='pick-team-name'>{team.name}</h5>
                                                            </div>
                                                        </td>
                                                        <td className='pick-date'>
                                                            {selections.firstPicks[division][idx]}
                                                        </td>                                            
                                                        <td className='pick-date'>
                                                            {selections.secondPicks[division][idx]}    
                                                        </td>                                            
                                                        <td className=''>
                                                            {team.lastScore } | {team.relatedRanking }
                                                        </td>
                                                    </tr>
                                                )
                                            
                                            })

                                        }
                                    </tbody>
                                </table>



                                {/* Popup Overlay */}
                    {popUpTeam && (
                        <div className="popup-overlay">
                            <div className="popup-content" id='pick-popup-content'>
                                <p className="close-btn" onClick={closePopup}>✖</p>
                                <h2>{popUpTeam.name}</h2>
                                <div className='pick-order-container'>
                                    <h5 className='pick-order-subtitle'>Orden Original</h5>
                                    <p className='pick-order-data'>{popUpTeam.order}</p>
                                    <p className='pick-order-data'>{selections.firstPicks[popUpTeam.division][popUpTeam.order-1]}</p>
                                    <p className='pick-order-data'>{selections.secondPicks[popUpTeam.division][popUpTeam.order-1]}</p>
                                
                                </div>

                                <div className='pick-order-container'>
                                    <h5 className='pick-order-subtitle'>Nuevo Orden</h5>
                                    <input
                                        type='number'
                                        value={selections.newOrder}
                                        onChange={(option)=>setSelections({...selections, newOrder:option.target.value})}
                                        className='pick-order-data'
                                        />
                                    <p className='pick-order-data'>{selections.firstPicks[popUpTeam.division][selections.newOrder-1]}</p>
                                    <p className='pick-order-data'>{selections.secondPicks[popUpTeam.division][selections.newOrder-1]}</p>
                                    
                                </div>

                                <button onClick={()=>handleSaveOrder(popUpTeam.division,popUpTeam.order)}>Guardar</button>
                            </div>
                        </div>
                    )}

                            </div>

                        )
                    }
                    

            </div>
        
    );
};

export default FreePick;
