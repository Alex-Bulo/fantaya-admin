import React, { useState, useEffect } from 'react';

import './StandingMatches.css';
import { URL } from '../../helper';

function StandingMatches({fixture}) {
const [showMatches , setShowMatches] = useState(false)
const [duplas, setDuplas] = useState( true )
//   const [popUpTeam, setPopUpTeam] = useState(null)
//   const [showPopup, setShowPopup] = useState(false) 
useState(()=>{

    if(fixture.matches.length>=1){        
        setDuplas( fixture.matches[0].teamAway.division === 'Duplas')
    }


},[])



  return (  
            
            fixture &&
                    <div className="fixture-container" key={`${fixture.id} ${Math.random()}`}>
                        <h2 onClick={()=>setShowMatches(!showMatches)}>Fecha {fixture.fantayaFecha}</h2>
                        {fixture.matches.map(m => {
                                    let teamLogoA = null;
                                    let teamLogoB = null;
                                    let match = m
                                                                   
                                    if(!duplas){
                                                            
                                        teamLogoA = `${URL}TeamsLogos/${match.idTeamHome}.png`
                                        teamLogoB = `${URL}TeamsLogos/${match.idTeamAway}.png`  
                                    }

                            return(

                                <div className={`match-container ${showMatches ? 'showMatches' : ''}`} >

                                    <div className={`match-home-container ${match.winner === 'home' ? 'win':''}`}>
                                    {teamLogoA && 
                                        <img 
                                            src={teamLogoA |`${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`}
                                            alt={`Logo ${match.idTeamHome}`} 
                                            title={match.teamHome.name} 
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                            }}        
                                        /> 
                                    }
                                    {!teamLogoA && <div></div> }
                                        <h4 className='match-team-name'>{match.teamHome.name}</h4>
                                        <h5 className='match-score'> {match.homeScore}</h5>
                                    </div>
                                    
                                    <div></div>
                                    
                                    <div className={`match-away-container ${match.winner === 'away' ? 'win':''}`}>
                                        <h5 className='match-score'> {match.awayScore}</h5>
                                        <h4 className='match-team-name'>{match.teamAway.name}</h4>
                                        {teamLogoB && 
                                            <img 
                                                src={teamLogoB || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                                alt={`Logo ${match.idTeamAway}`} 
                                                title={match.teamAway.name} 
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
                    </div>
                        
                    
                

            
        



  );
}

export default StandingMatches;
