import React, { useState, useEffect } from 'react';

import './StandingTable.css';
import { URL } from '../../helper';

function StandingTable({standingData}) {

  const [popUpTeam, setPopUpTeam] = useState(null)
  const [showPopup, setShowPopup] = useState(false) 
  const [duplas, setDuplas] = useState(false) 


  const handleRowClick = (team) => {
    setPopUpTeam(team); // Set selected team data
      setShowPopup(true); // Show the popup
  };


  const closePopup = () => {
      setShowPopup(false);
      setPopUpTeam(null);
  };

  const getRankingClass = (idx, last) => {
    if(duplas){
        if (idx <= 7) return 'standing-top-1';
        if (idx <= 19) return 'standing-top-2';
        if (idx <= 31) return 'standing-top-3';
        return '';
        
    }else{

        
        if (idx === 0) return 'standing-top-1';
        if (idx === 1) return 'standing-top-2';
        if (idx === 2) return 'standing-top-3';

        if (idx === last-2) return 'standing-bottom-1';
        if (idx >= last-1) return 'standing-bottom-2';
        return '';

    }
  };

  const handleOutsideClick = (e) => {
      if (e.target.classList.contains('popup-overlay')) {
          closePopup();
      }
  };

  // event listener on mount and remove it on unmount
  useEffect(() => {
    
    setDuplas(
        standingData[0].name !== standingData[0].standings[0]?.homeTeam &&
        standingData[0].name !== standingData[0].standings[0]?.awayTeam
      )



    document.addEventListener('click', handleOutsideClick);
      return () => {
          document.removeEventListener('click', handleOutsideClick);
      };

      
  }, []);



  return (  
        
        standingData &&
                <>
                    <table className='standing-table'>
                        <thead>
                            <tr>
                                <th className=''>#</th>
                                <th className='standing-team-col'></th>
                                <th className=''>G</th>
                                <th className=''>E</th>
                                <th className=''>P</th>
                                <th className=''>+ | -</th>
                                <th className=''>Extra</th>
                                <th className=''>Puntos</th>
                                <th className='standing-form-col'>Forma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standingData.map((team,idx) => {
                                const overallStanding = team.overall
                                const form = team.standings.map(m => m.result)
                                
                                let teamLogo;
                                try { teamLogo = `${URL}TeamsLogos/${team.id}.png` } catch (error) { teamLogo = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png` }
                                const rankingClass = getRankingClass(idx, standingData.length-1)
                            

                                return(
                                    <tr key={team.id} className={rankingClass} onClick={() => handleRowClick(team)}>
                                        <td className='standing-rank-col'>{idx + 1}</td>
                                        <td className=' standing-team-col'>
                                            <img 
                                                src={teamLogo || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                                alt={`Logo equipo local ${overallStanding.name}`} 
                                                title={`${overallStanding.name}`} 
                                                onError={(e) => {
                                                    e.target.onerror = null; // Prevent infinite loop
                                                    e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                                }}
                                            />
                                            <h4 className='standing-team-name'>{overallStanding.name}</h4>
                                        </td>
                                        <td className=''>{overallStanding.wins}</td>
                                        <td className=''>{overallStanding.draws}</td>
                                        <td className=''>{overallStanding.loses}</td>
                                        <td className=''>{overallStanding.scored} | {overallStanding.received}</td>
                                        <td className=''>{overallStanding.pExtra}</td>
                                        <td className='standing-totalPoints-col'>{overallStanding.totalPoints}</td>
                                        <td className='standing-form-col'>
                                            {form.slice(-5).map((result,idx)=>
                                                <div key={idx} className={`form-result result-${result}`}>{result}</div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Popup Overlay */}
                    {showPopup && popUpTeam && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <h2>Partidos</h2>
                                {popUpTeam.standings.sort((a,b)=>a.fixtureFantaya - b.fixtureFantaya).map(m => {


                                    let teamLogoA = null;
                                    let teamLogoB = null;
                                    let match = m

                                    
                                    if(duplas){
                                        const teamInHomeDupla = m.homeTeam.toLowerCase().includes(popUpTeam.name.toLowerCase()) 
                                        match.home = teamInHomeDupla
                                        match.winnerClass = match.result==='D' ? '' : 
                                                            (match.result === 'W' && teamInHomeDupla || match.result === 'L' && !teamInHomeDupla ) ? 'home' : 
                                                            (match.result === 'W' && !teamInHomeDupla || match.result === 'L' && teamInHomeDupla) ? 'away' : ''
                                                            
                                        
                                    }else{

                                        teamLogoA = `${URL}TeamsLogos/${match.homeTeamID}.png` 
                                        teamLogoB = `${URL}TeamsLogos/${match.awayTeamID}.png`

                                        match.home = match.homeTeamID === popUpTeam.id
                                        match.winnerClass = match.result==='D' ? '' : match.home && match.result === 'W' ? 'home' : 'away'
                                    }
                                    
                                    
                                    return(
                                        
                                        <div className='match-container'>
                                            <div className={`match-home-container ${match.winnerClass === 'home' ? 'win':''}`}>
                                            {teamLogoA && 
                                                <img 
                                                    src={teamLogoA || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                                    alt={`Logo ${match.homeTeam}`} 
                                                    title={match.homeTeam} 
                                                    onError={(e) => {
                                                        e.target.onerror = null; // Prevent infinite loop
                                                        e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                                    }}    
                                                    /> 
                                                }
                                            {!teamLogoA && <div></div> }
                                                <h4 className='match-team-name'>{match.homeTeam}</h4>
                                                <h5 className='match-score'> {match.home ? match.scored : match.received}</h5>
                                            </div>
                                            
                                            <div></div>
                                            
                                            <div className={`match-away-container ${match.winnerClass === 'away' ? 'win':''}`}>
                                                <h5 className='match-score'> {!match.home ? match.scored : match.received}</h5>
                                                <h4 className='match-team-name'>{match.awayTeam}</h4>
                                                {teamLogoB && 
                                                    <img 
                                                        src={teamLogoB || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                                        alt={`Logo ${match.awayTeam}`} 
                                                        title={match.awayTeam} 
                                                        onError={(e) => {
                                                            e.target.onerror = null; // Prevent infinite loop
                                                            e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                                        }}        
                                                    />
                                                }
                                                {!teamLogoB && <div></div> }
                                            </div>
                                            
                                        
                                        </div>
                                    )
                                    })
                                
                                }
                                <button onClick={closePopup}>Close</button>
                            </div>
                        </div>
                    )}
                </>

            
        



  );
}

export default StandingTable;
