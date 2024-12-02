import React from 'react';
import AssistIcon from '../../Resources/Icons/assistIcon.png'
import './CardPlayer.css'
import { iconDictionary as i, URL } from '../../helper';


function CardPlayer ({ player, fantaHome, openCard }){
    
    // const playerLogo = `${URL}players/${player.idPlayer}.png`

    return(
        player ?
        (
            <td key={player.idPlayer} onClick={()=>openCard(player)} className={`card-player  ${fantaHome ? 'home' : 'away'} ${player.lineup==='Suplente'? 'bench' :''}` }>
                <img 
                    className="card-player-img"
                    src={`${URL}players/${player.idPlayer}.png` || `${URL}players/genericPlayer.png`}
                    alt={`${player.player.name} Image`}
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `${URL}players/genericPlayer.png`;
                    }}
                
                />

                
                <div className="card-player-info">
                    <p className="card-player-name"> {player.player.name} </p>
                    <p className="card-player-position">{player.player.position}</p>
                </div>

                <div className="card-player-icons fantaEvents">
                    {player.details?.figura && <i className={`${i.figura}`} title="Figura"/>}
                    {player.details?.liderPases && <i className={`${i.liderPases}`} title="Lider de Pases"/>}
                    {player.details?.amarillas > 0 && <i className={`${i.amarillas}`} title="Amarilla"/>}
                    {player.details?.rojas > 0&& <i className={`${i.rojas}`} title="Roja"/>}
                    {player.details?.asistencias >0 && <img src={AssistIcon} className="assist-icon" alt='Asistencia' title='Asistencia' /> }
                    {player.details?.atajadas >=5 && <i className={`${i.atajadas}`} title="Atajadas"/>}
                    {player.details?.penalAtajado >0 && <i className={`${i.penalAtajado}`} title="Penal Atajado"></i>}
                    {player.details?.goles >0 && <i className={`${i.goles}`} title="Gol"/>}
                    {player.details?.golesRecibidos >0 && <i className={`${i.golesRecibidos}`} title="Gol Recibido"/>}
                    {player.details?.fpJugado <0 && <i className={`${i.minutosJugadosFantaya}`} title="Tiempo en Cancha"></i>}
                    {player.details?.penalGol >0 && <i className={`${i.penalGol}`} title="Gol de Penal"></i>}
                    {player.details?.penalErrado >0 && <i className={`${i.penalErrado}`} title="Penal Errado"></i>}
                    {player.details?.vallaInvicta >0 && <i className={`${i.vallaInvicta}`} title="Valla Invicta"></i>}
                    {player.details?.golEnContra >0 && <i className={`${i.golEnContra}`} title="Valla Invicta"></i>}
                </div>

                <div className="card-player-icons fantaSelections">
                    
                    {player.defensorDesignado && <i className="fas fa-shield dd-icon" title="Defensor Designado"/>}
                    {player.captain && <i className="fas fa-ring captain-icon" title="Captain"/>}

                </div>
                
                <div className="card-player-fp">
                    {player.totalFantapoints}
                </div>
            </td>  
        ) :
        (
            <td key={Math.random()} className="card-player">
            
            </td>
        )


        
    )
    
};


export default CardPlayer;
