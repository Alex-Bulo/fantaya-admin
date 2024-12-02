import React, { useState, useEffect } from 'react';

import './FantayaStandings.css';
import { getSeasonsWithDetails, getStandingByFixture, saveRankings } from '../../callDB.js';
import Selector from '../Selector.js';
import StandingTable from '../Standings/StandingTable.js';
import { normalizeDate } from '../../helper.js';
import StandingMatches from '../Standings/StandingMatches.js';
import StandingPlayoff from '../Standings/StandingPlayoff.js';

function FantayaStandings() {
  const [selections, setSelections] = useState({
    season:'',
    standings: true,
    matches: false
  })
  const [allSeasons, setAllSeasons] = useState([])
  const [filteredSeasons, setFilteredSeasons] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [standingData, setStandingData] = useState([])
  const [lastUpdated, setLastUpdated] = useState([])
  

  // State to store the selected date
  const [dummyState, setDummyState] = useState(0);


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
            // GETSTANDINGS

            const seasonType = allSeasons.find(s=>s.id==selections.season).type
            const {standings,fixtures} = await getStandingByFixture(selections.season)
            
            let stats
            if(seasonType==='Todos'){
                stats = calculateStanding_Table(standings)
            }else if( seasonType==='Zonas'){
                stats = groupCalcStanding_TableBy(standings,'grupo')
            }else if( seasonType==='Torneo'){
                stats = groupCalcStanding_TableBy(standings,'division')
            }else if( seasonType==='Playoff'){
                // console.log(standings)                
            }
            
            const lastUpdate = allSeasons.find(s=>s.id==selections.season).type==='Todos' ? 
                                stats.map(team => team.standings.map(f => f.updatedAt)).flat().sort() : 
                                stats.map(division => division.standings.map(team => team.standings.map(f => f.updatedAt))).flat(2).sort()

            setStandingData(stats)

            setFixtures(fixtures)
            
            setLastUpdated(lastUpdate[lastUpdate.length - 1])
            
            return standings
                            

        } catch (error) {
            console.error("Error fetching fixtures:", error);
        }
    };

    setStandingData(null)
    if(selections.season){

        setFilteredSeasons(allSeasons.find(s=>s.id==selections.season))
        
        fetchData();
        
    }

},[selections.season, dummyState])

const calculateStanding_Table = (data) =>{

    const uniqueFixtureIDs = [
        ...new Set(data.flatMap(team => team.standings.map(standing => standing.idFixture)))
    ]

    // Rank teams by each fixture's points
    const rankByEachFixture = uniqueFixtureIDs.map(fixtureID => {
        // For each fixtureID, get points for all teams in that fixture and sort them
        const rankedTeams = data.map(team => {
            const fixtureStanding = team.standings.find(standing => standing.idFixture === fixtureID);
            const fixturePoints = fixtureStanding ? fixtureStanding.totalPoints : 0;
            const fixtureScored = fixtureStanding ? fixtureStanding.scored : 0;
            const fixtureReceived = fixtureStanding ? fixtureStanding.received : 0;
            
            return { ...team, fixturePoints,fixtureScored,fixtureReceived };
        }).sort((a, b) => 
            b.fixturePoints - a.fixturePoints ||                // Sort by totalPoints descending
            b.fixtureScored - a.fixtureScored ||               // Then by scored descending
            a.fixtureReceived - b.fixtureReceived              // Then by received ascending
        )
        
        return rankedTeams;
    }).flat()

    rankByEachFixture.forEach((team, idx) => {
        team.standings.forEach(f => {
            f.ranking = idx + 1
        })
    })
    

    const allStandings = rankByEachFixture.map(team => {
        const overall = {
            totalPoints: team.standings.reduce((acc, standing) => acc + standing.totalPoints, 0),
            scored: team.standings.reduce((acc, standing) => acc + standing.scored, 0),
            received: team.standings.reduce((acc, standing) => acc + standing.received, 0),
            wins: team.standings.reduce((acc, standing) => acc + (standing.result === 'W'?1:0), 0),
            draws: team.standings.reduce((acc, standing) => acc + (standing.result === 'D'?1:0), 0),
            loses: team.standings.reduce((acc, standing) => acc + (standing.result === 'L'?1:0), 0),
            pExtra: team.standings.reduce((acc, standing) => acc + standing.bonusPoints , 0),
        }
        
        return { ...team, overall };
    }).sort((a, b) => 
        b.overall.totalPoints - a.overall.totalPoints || // Sort by overallPoints descending
        b.overall.scored - a.overall.scored || // Then by overallScored descending
        a.overall.received - b.overall.received // Then by overallReceived ascending
    );

    
    allStandings.forEach((team, idx) => {
        team.overall.name = team.name
        team.overall.ranking = idx + 1
        team.overallRanking = idx + 1
    })
    
    const uniqueById = new Map();

    // Loop through the array and store the first instance of each id
    allStandings.forEach((item) => {
    if (!uniqueById.has(item.id)) {
        uniqueById.set(item.id, item);
    }
    });

    // Convert the Map values back to an array
    const finalStandings = Array.from(uniqueById.values());
    
    return finalStandings

}

const groupCalcStanding_TableBy = (data, category) =>{
    // Group standings by category
    const groupByCat = data.reduce((acc, team) => {
        // If the category doesn't exist, create it
        if (!acc[team[category]]) {
            acc[team[category]] = [];
        }
        
        // Push the team into the corresponding group
        acc[team[category]].push(team) 
        
        return acc;
    }, {});
    
    // Create the final structure with category and standings
    const consolidatedArray = Object.keys(groupByCat).map((cat) => {
        // Get the output array for the current division
        const outputArray = calculateStanding_Table(groupByCat[cat]);
    
        // Return the final structure
        return {
        division: cat,
        standings: outputArray,
        };
    });

    return consolidatedArray
  
}

const handleSaveClick = async () =>{
    
    const info = filteredSeasons.type==='Todos' ? standingData : standingData.map(division=>division.standings).flat()


    const fixtureRankings = info.map(team => team.standings.map(f =>{
        return {
            idFixture:f.idFixture,
            idTeam: f.idTeam,
            ranking: f.ranking
        }
    })).flat()
    
    const savedStandings = await saveRankings(fixtureRankings)
    
    const newDummy = savedStandings.length ? dummyState+1 : dummyState 
    setDummyState(newDummy)
    
    
}


  return (  
      <div className='main-component'>
        <div className='userActions-container'>
            {fixtures && 
                    <Selector
                        options={allSeasons}
                        selectedOption={selections.season}
                        setSelectedOption={(option) => setSelections({...selections, season:option})}
                        defOption='Elegir Temporada'
                    />
            }

            <div className="toggler">
                <input
                    type="checkbox"
                    id="toggle-checkbox"
                    checked={selections.standings}
                    onChange={(option) => setSelections({...selections, standings:!selections.standings, matches:!selections.matches})}
                />
                <label htmlFor="toggle-checkbox" className="toggle-label">
                <span className="toggle-text">
                    {selections.standings ? 'Posiciones' : 'Partidos'}
                </span>
                </label>
            </div>

            <button className='action-button' onClick={handleSaveClick} disabled={selections.matches}>Guardar</button>
        </div>


        {(selections.matches && fixtures ) &&
            <div className='standing-container'>
                {fixtures.map(f => <StandingMatches fixture={f} />)}
            </div>
        }
        
        {(selections.standings && standingData && (filteredSeasons.type==='Todos')) &&
            <div className='standing-container'>
                <h3 className='standing-title'>Tabla General</h3>
                <p className='lastUpdate'>Guardado: {normalizeDate(lastUpdated)}</p>
                <StandingTable standingData={standingData} />
            </div>
        }

        {( selections.standings && standingData && (filteredSeasons.type==='Zonas' || filteredSeasons.type==='Torneo') ) &&
            standingData.map((i,idx)=>
                
                <div className='standing-container' key={i.division}>
                    <h3 className='standing-title'>Tabla {filteredSeasons.type==='Zonas'?'Zona':'Categoría'} {i.division}</h3>
                    {idx===0 && <p className='lastUpdate'>Guardado: {normalizeDate(lastUpdated)}</p>}
                    <StandingTable standingData={i.standings} />
                </div>
            )
        }

        {( selections.standings && standingData && filteredSeasons.type==='Playoff' ) &&
            standingData.map((i,idx)=>
                
                
                <div className='standing-container' key={idx}>
                    <h3 className='standing-title'>Playoff</h3>
                    {idx===0 && <p className='lastUpdate'>Guardado: {normalizeDate(lastUpdated)}</p>}
                    <StandingPlayoff standingData={i.standings} />
                </div>
            )
        }


      </div>

  );
}

export default FantayaStandings;
