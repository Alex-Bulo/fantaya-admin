import React from 'react';



function MatchSelector ({ matches, selectedMatch, setSelectedMatch }){
    
    
    
    
    
    
    return(

        <select value={selectedMatch} onChange={(e) => {
            const teamA = matches.find(m => m.id == e.target.value).idTeamHome
            const teamB = matches.find(m => m.id == e.target.value).idTeamAway
            setSelectedMatch(e.target.value, teamA, teamB)            
        }}>
            <option value="">Elegir Partido</option>

            {matches.map(match => (
                <option key={match.id} value={match.id}>{match.detail}</option>
            ))}

        </select>
    )
    
};

export default MatchSelector;
