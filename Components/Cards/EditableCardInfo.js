import React, { useEffect, useState } from 'react';

import './EditableCardInfo.css';
import { iconDictionary as i, URL } from '../../helper';

function EditableCardInfo({data, confirmEditable_CDD, onClose}) {
    const [playerData, setPlayerData] = useState(null)
    const [playerFP, setPlayerFP] = useState(null)

    const eventsDictionary = {
        minutoInicial: 'Minuto Inicial' ,
        minutoFinal: 'Minuto Final' ,
        minutosJugadosFantaya: 'Minutos Jugados (Fantaya)' ,
        figura: 'Figura' ,
        vallaInvicta: 'Valla invicta',
        liderPases: 'Lider de pases' ,
        asistencias: 'Asistencia' ,
        assistPost85: "Asistencia post85'",
        pases: 'Pases' ,
        goles: 'Gol',
        golEnContra: 'Gol en contra' ,
        golesFueraArea: 'Gol fuera del área',
        golesPost85: "Gol post85'" ,
        golesPost85CambiaResultado: "Gol post85' Cambia Resultado" ,
        penalGol: 'Gol de Penal',
        penalErrado: 'Penal Errado',
        penalAtajado: 'Penal Atajado',
        atajadas: 'Atajadas',
        golesRecibidos: 'Gol Recibido' ,
        amarillas: 'Amarillas' ,
        rojas: 'Rojas',
        fpResultado: 'Resultado',
    }

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (e.target.classList.contains('popup-overlay')) {
                onClose();
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [onClose])

    useEffect(()=>{
        
        setPlayerData(data)
        setPlayerFP(data.totalFantapoints)

    },[])

    // Function to handle changes to each field
    const handleChange_cdd = (e, field) => {
        
        if(field==='totalFantapoints'){
            setPlayerFP(Number(e.target.value))

            const newpData = {
                ...playerData,
                totalFantapoints: Number(e.target.value)
            }

            setPlayerData(newpData)

        }else{
            setPlayerFP(playerFP + Number(e.target.value))
            
            const newpData = {
                ...playerData,
                [field]:Number(e.target.value)||0,
                totalFantapoints: playerFP + Number(e.target.value)
            }
            
            setPlayerData(newpData)
        }


        
    }


    const handleConfirm = () => {
        
        confirmEditable_CDD([{...playerData}])
        onClose()

    };
    

  return (  
    playerData &&
    <div className="popup-overlay">
            <div className="popup-content" id='card-popup'>
                <button className="close-btn" onClick={onClose}>✖</button>
                <div className="player-card-table">

                    <div className='player-card-top'>
                        
                        <div className='player-card-player'>
                            <img 
                                className='player-card-pic' 
                                src={`${URL}players/${playerData.idPlayer}.png` || `${URL}TeamsLogos/genericPlayer.png`} 
                                onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = `${URL}players/genericPlayer.png`;
                                }}
                            />
                            <h3 className='player-card-name'>{playerData.player.name}</h3>
                        </div>
                        
                        <div className='player-card-player-info'>
                            <div className='player-card-info'>
                                <h5 className='player-card-field-name'>Posición</h5>
                                <h4 className='player-card-field-data'>{playerData.player.position}</h4>
                            </div>
                            <div className='player-card-info'>
                                <h5 className='player-card-field-name'>Equipo</h5>
                                <h4 className='player-card-field-data'>{playerData.player.realTeam}</h4>
                            </div>

                        </div>

                    </div>

                    <div className='player-card-ddc'>
                        <label className='player-card-field-name'>
                            <div>
                                <i className="fas fa-ring captain-icon card-icon" title="Fantapuntos"/>
                                Total FP
                            </div>
                            <input
                                
                                type='Number'
                                className='no-arrows'
                                
                                value={playerFP}
                                onChange={(e)=>handleChange_cdd(e,'totalFantapoints')}
                                />
                        </label>
                        <label className='player-card-field-name'>
                            <div>
                                <i className="fas fa-ring captain-icon card-icon" title="Captain"/>
                                Capitan
                            </div>
                            <input
                                
                                type={playerData.captain ? 'Number' : 'Text'}
                                className='no-arrows'
                                disabled={!playerData.captain}
                                value={playerData.captain ? playerData.captainPoints||0 : 'No'}
                                onChange={(e)=>handleChange_cdd(e,'captainPoints')}
                                />
                        </label>
                        <label className='player-card-field-name'>
                            <div>
                                <i className="fas fa-shield dd-icon card-icon" title="Defensor Designado"/>
                                DD
                            </div>
                            <input
                                type={playerData.defensorDesignado ? 'Number' : 'Text'}
                                className='no-arrows'
                                disabled={!playerData.defensorDesignado}
                                value={playerData.defensorDesignado? playerData.ddPoints||0 : 'No'}
                                onChange={(e)=>handleChange_cdd(e,'ddPoints')}
                            />
                        </label>
                    </div>

                    {Object.keys(eventsDictionary).map((key, index) => 
                         (playerData.details[key] ||playerData.details[key]>0 ) && (
                            <div className='player-card-row'>
                                <div>
                                    {i[key]&& <i className={`${i[key]}`}/>}
                                    <h5 className='player-card-field-name'>{eventsDictionary[key]}</h5>
                                </div>
                                <h4 className='player-card-field-data'>{playerData.details[key]}</h4>
                            </div>
                        )

                    )}

                </div>

            <button className="save-btn" onClick={handleConfirm}>Confirmar</button>
        
        </div>
    </div>
  
  );
}

export default EditableCardInfo;
