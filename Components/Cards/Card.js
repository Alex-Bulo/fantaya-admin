import React, { useEffect, useState } from 'react';
import { cards_logic } from '../../dataManipulation';
import CardPlayer from './CardPlayer';
import './Card.css';
import { updateCardPointsAndMatch, updateCardPointsAndMatchmultiple } from '../../callDB';
import EditableCardInfo from './EditableCardInfo';
import { URL } from '../../helper';


function Card ({ players, teams, fixture, allCaptains }){
   
    const [showFullCard , setShowFullCard] = useState(false)
    const [fantaStats , setFantaStats] = useState(null)
    const [fantaScores , setFantaScores] = useState(null)
    const [editableInfo, setEditableInfo] = useState(null)
    
    const bddStructure_CardPoints = {
        idFixture:'', idPlayer:'', idTeam:'',
        eventsFantapoints:'', defensorDesignado:'', ddPoints:'',
        captain:'', captainPoints:'', 
        lineup:'', totalFantapoints:''
    }

    const teamLogoA =`${URL}TeamsLogos/${teams.home.id}.png`
    const teamLogoB =`${URL}TeamsLogos/${teams.away.id}.png`
    
    // logica de Suplentes, DD y C y totalScore
    useEffect(()=>{
        
        const [stats,scores] = cards_logic(players[0], players[1], 'initial', allCaptains)
        
        setFantaStats(stats)
        setFantaScores(scores)

        
    },[players])
      

    // sobreescribe y recalcula Capitan y DD edicion del usuario
    const handleConfirm_CDDEdit = (player) =>{
        
        
        const lookupOnUserEdits = Object.fromEntries(player.map(obj => [obj.idPlayer, obj]));
        // // const lookupOnUserEdits = Object.fromEntries([player.idPlayer, player]);

        const newHomeInfo = fantaStats.fantaHome.map(p => {
            const toEdit = lookupOnUserEdits[p.idPlayer] || null

            return toEdit || p;
        });
        const newAwayInfo = fantaStats.fantaAway.map(p => {
            
            const toEdit = lookupOnUserEdits[p.idPlayer] || null

            return toEdit || p;
        });
        
        const [stats,scores] = cards_logic(newHomeInfo, newAwayInfo, 'userCDD')
        
        setFantaStats(stats)
        setFantaScores(scores)

    }
    // envia informacion de tarjeta final a BdD (eventsFantapoints, ddPoints, captainPoints, totalFantapoints)
    const handleSaveCard = () =>{
        
        if(!allCaptains){
            const teamsData = [...fantaStats.fantaHome, ...fantaStats.fantaAway]
            
            const matchDataToSave ={
                idFixture: fixture,
                idTeamHome: fantaStats.fantaHome[0].idTeam,
                idTeamAway: fantaStats.fantaAway[0].idTeam,
                homeScore: fantaScores.home,
                awayScore: fantaScores.away,
                winner: fantaScores.home === fantaScores.away ? 'tie' : fantaScores.home > fantaScores.away ? 'home' : 'away'
            }
    
      
            // resetSelections()
            updateCardPointsAndMatch(teamsData,matchDataToSave)
        }else{
            const teamsData = [...fantaStats.fantaHome, ...fantaStats.fantaAway]
            
            const matchDataToSave =[
                {
                    idFixture: fixture,
                    idTeam: fantaStats.fantaHome[0].idTeam,
                    score: fantaScores.home,
                },
                {
                    idFixture: fixture,
                    idTeam: fantaStats.fantaAway[0]?.idTeam || null,
                    score: fantaScores.away,
                }
            ]
    
      
            // resetSelections()
            updateCardPointsAndMatchmultiple(teamsData,matchDataToSave.filter(item => item.idTeam))

        }
        
    }

    const handleClosePopUp = () =>{
        setEditableInfo(null)
    }
    
    const handlePlayerClick = (player) =>{
        setEditableInfo(null)

        if(player){
            setEditableInfo(player)
        }
      }
    
    const expandCard = ()=>{

        setShowFullCard((prev)=> !prev)

    }

    return(
        fantaStats &&
        <div className={`card-container ${allCaptains? 'multiple-card' : ''}`} key={`${teams.home.id}${teams.away.id}`}>
            { editableInfo &&
                <EditableCardInfo data={editableInfo} confirmEditable_CDD={handleConfirm_CDDEdit} onClose={handleClosePopUp}/>
            }
            <table className={`card-table ${allCaptains? '' : ''}`}>

                <thead onClick={expandCard}>
                    <tr className='card-row'>
                        <th className='card-header home-header'>
                                <div className='card-header-team-home'>
                                    <img 
                                        className='card-header-logo' 
                                        src={teamLogoA || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                        alt={`Logo ${teams.home.name}`} 
                                        title={`${teams.home.name}` }
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                        }}
                                    />
                                    <h3 className='card-header-name'> {teams.home.name} </h3>
                                </div>
                                <div className='card-header-score'> {fantaScores.home} </div>
                        </th>
                        
                        {fantaStats.fantaAway.length>0 && <th className='card-header away-header'>
                                <div className='card-header-score'> {fantaScores.away} </div>
                                <div className='card-header-team-away'>
                                    <h3 className='card-header-name'> {teams.away.name} </h3>
                                    <img 
                                        className='card-header-logo' 
                                        src={teamLogoB || `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`} 
                                        alt={`Logo equipo local ${teams.away.name}`} 
                                        title={`${teams.away.name}` }
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = `${URL}TeamsLogos/generic${Math.floor(Math.random() * 8) + 1}.png`;
                                        }}
                                    />
                                </div>
                        </th>}
                        
                    </tr>
                </thead>

                <tbody className={`Card ${showFullCard?'showFullCard': ''}`}>

                    {Array.from({ length: fantaStats.maxPlayers }).map((_, idx) => (
                        <tr key={idx} className="card-row">
                            {/* Home Team - Left Side */ }
                            <CardPlayer openCard={handlePlayerClick} player={fantaStats.fantaHome.filter(i=>i.lineup !=='No Convocado')[idx]} fantaHome={true} />
                            {/* Away Team - Right Side */ }
                            {fantaStats.fantaAway.length>0 && <CardPlayer openCard={handlePlayerClick} player={fantaStats.fantaAway.filter(i=>i.lineup !=='No Convocado')[idx]} fantaHome={false} /> }
                        </tr>
                    
                    ))}
                </tbody>
                
                
            </table>

            <button className='action-button card-save' onClick={handleSaveCard}>Guardar</button>
        
        </div>
                
    )
    
};


export default Card;
