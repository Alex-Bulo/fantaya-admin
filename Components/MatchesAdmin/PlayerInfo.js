import React, { useEffect, useState } from 'react';

import './PlayerInfo.css';
import { URL } from '../../helper';

function PlayerInfo({data, fantayaSetter, onClose}) {
    const [playerData, setPlayerData] = useState(null)
    const [playerPic, setPlayerPic] = useState(null)

    const keyDictionary = {
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
        const pic = `${URL}players/${data.id}.png`
        setPlayerPic(pic)


        setPlayerData({
            id: data.id,
            jugador: data.jugador,
            playerPosition:data.playerPosition,
            home:data.home,
            amarillas: data.amarillas,
            rojas: data.rojas,
            golesRecibidos: data.golesRecibidos,
            penalAtajado: data.penalAtajado,
            penalGol: data.penalGol,
            penalErrado: data.penalErrado,
            atajadas: data.atajadas,
            goles: data.goles,
            golEnContra: data.golEnContra ,
            asistencias: data.asistencias ,
            pases: data.pases ,
            minutoInicial: data.minutoInicial ,
            minutoFinal: data.minutoFinal ,
            minutosJugadosApi: data.minutosJugadosApi,
            minutosJugadosFantaya: data.minutosJugadosFantaya ,
            golesPost85: data.golesPost85,
            golesPost85CambiaResultado: data.golesPost85CambiaResultado,
            golesFueraArea: data.golesFueraArea,
            assistPost85: data.assistPost85,
            liderPases: data.liderPases ,
            figura: data.figura,
            vallaInvicta: data.vallaInvicta
        })

    },[data])

    // Function to handle changes to each field
    const handleChange = (e, field) => {
        
        setPlayerData({
            ...playerData,
            [field]: e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value)
        })
    }


    const handleSave = () => {
        fantayaSetter(playerData)
        onClose()

    };
    

  return (  
    playerData &&
    <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}>✖</button>
                <h3>Info del jugador <strong>{playerData.jugador}</strong></h3>
                <img 
                    className='player-info-pic' 
                    src={playerPic || `${URL}TeamsLogos/genericPlayer.png`} 
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `${URL}players/genericPlayer.png`;
                    }}
                />
                <div className="player-info-table">
                        {Object.keys(keyDictionary).map((key, index) => 
                            key !== 'playerName' && (
                                <div key={index} className="field-row">
                                    <label>{keyDictionary[key]}</label>
                                
                                        {typeof playerData[key] === 'boolean' ? (
                                            <label className='checkbox-label'>
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleChange(e, key)}
                                                    checked={playerData[key]}
                                                    className="custom-checkbox"
                                                />
                                                <span className='slider'></span>
                                            </label>
                                            ) : (

                                                    <input
                                                        type="number"
                                                        value={playerData[key] === null ? 0 : playerData[key]}
                                                        onChange={(e) => handleChange(e, key)}
                                                    />

                                            )}
                                    </div>
                            )
                        )}
                </div>

            <button className="save-btn" onClick={handleSave}>Guardar</button>
        
        </div>
    </div>
  
  );
}

export default PlayerInfo;
