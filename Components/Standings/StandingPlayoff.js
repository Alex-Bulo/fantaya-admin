import React, { useState, useEffect } from 'react';

import './StandingPlayoff.css';
import { URL } from '../../helper';

function StandingPlayoff({standingData}) {

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
                    <div className='playoffContainer'>
                        
                    </div>
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

export default StandingPlayoff;
