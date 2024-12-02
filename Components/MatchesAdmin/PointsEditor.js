import React, { useState, useEffect } from 'react';
import { getEventsByFixture, getFixture, getSeasonsWithDetails, savePlayersEvents, } from '../../callDB.js';

import SeasonFixtureFilters from '../SeasonFixtureFilters.js';
import Selector from '../Selector.js';
import PlayerInfo from './PlayerInfo.js';
import { FP_CalculateAllPoints, replaceObjectById } from '../../dataManipulation.js';

import './PointsEditor.css';
import { URL } from '../../helper.js';




const PointsEditor = () => {
    const [selections, setSelections] = useState({
        fixture: '',
        season:'',
        realTeam:'',
        position:''
    });

    const [allSeasons, setAllSeasons] = useState([])
    const [fixtures, setFixtures] = useState([]);

    const [allPlayers, setAllPlayers] = useState([]);
    const [allRealTeams, setAllRealTeams] = useState([]);
    const [allPositions, setAllPositions] = useState([
        {id:1,name:'Equipo'}, {id:2,name:'Arq'}, 
        {id:3,name:'Def'}, {id:4,name:'Med'}, 
        {id:5,name:'Del'}
    ])
    

    const [filteredPlayers, setFilteredPlayers] = useState([]);

    const [showPopup, setShowPopUp] = useState(false);
    const [popUpPlayer, setPopUpPlayer] = useState([]);

    


    useEffect(()=>{
        const fetchData = async () => {
            try {


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

                const fixturesData = await getFixture(selections.season)
                
                
                setFixtures(fixturesData)
                                

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        if(selections.season){

            fetchData();
        }

    },[selections.season])

    useEffect(()=>{
        const fetchData = async () => {
            try {

                const playersData = await getEventsByFixture(selections.fixture)

                const positionOrder = ['Equipo', 'Arq', 'Def', 'Med', 'Del'];
                const sortedPlayersData = playersData.sort((a, b) => {
                    // First, compare by realTeam (alphabetically)
                    if (a.realTeam < b.realTeam) return -1;
                    if (a.realTeam > b.realTeam) return 1;

                    // If realTeams are the same, compare by position based on custom order
                    const positionA = positionOrder.indexOf(a.position);
                    const positionB = positionOrder.indexOf(b.position);
                    if (positionA < positionB) return -1;
                    if (positionA > positionB) return 1;

                    // If positions are the same, compare by name (alphabetically)
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;

                    return 0;
                });    


                const premiereTeams = sortedPlayersData.filter(p => p.position==='Equipo')                
                
                sortedPlayersData.forEach(p=>{
                    p.realTeamID = premiereTeams.find(team => team.name === p.realTeam)?.id
                    p.playerevent = p.playerevent[0]
                })

                setAllRealTeams(premiereTeams)
                setAllPlayers(sortedPlayersData)
                setFilteredPlayers(sortedPlayersData)
                
                                

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        if(selections.fixture){

            fetchData();
        }



    },[selections.fixture])

    useEffect( ()=>{
        const realTeamName = allPlayers.find(p => p.id == selections.realTeam)?.name || ''
        
        const newFiltered = allPlayers
            .filter(p => selections.realTeam ? p.realTeam === realTeamName : true)
            .filter(p => selections.position ? p.position === allPositions.find(pos=> pos.id==selections.position).name : true)
                
        
        setFilteredPlayers(newFiltered)


        

    },[allPlayers,selections.realTeam, selections.position])
    

    const handlePlayerClick = (player) =>{

        setShowPopUp(true)
        const newPopUpPlayer = player
        newPopUpPlayer.info = player.playerevent

        newPopUpPlayer.info.id = player.id
        newPopUpPlayer.info.jugador = player.name
        newPopUpPlayer.info.playerPosition = player.position
        newPopUpPlayer.info.realTeam = player.realTeam
        newPopUpPlayer.info.realTeamID = player.realTeamID


        setPopUpPlayer(newPopUpPlayer)
        


    }

    const handleUserEdits = (playerData) =>{
    
        const newPlayers = allPlayers
        const modSelectedPlayer = popUpPlayer
        
        const newStats = FP_CalculateAllPoints(playerData)
        
        
        const consolidatedNewStat = {...playerData, ...newStats[0], ...newStats[1]}


        modSelectedPlayer.playerevent = consolidatedNewStat
        delete modSelectedPlayer.info

        replaceObjectById(newPlayers, modSelectedPlayer)    

        const cleanedToDB = [{
            id: modSelectedPlayer.id,
            home:modSelectedPlayer.playerevent.home,
            amarillas:modSelectedPlayer.playerevent.amarillas,
            rojas:modSelectedPlayer.playerevent.rojas,
            golesRecibidos:modSelectedPlayer.playerevent.golesRecibidos,
            penalAtajado:modSelectedPlayer.playerevent.penalAtajado,
            penalGol:modSelectedPlayer.playerevent.penalGol,
            penalErrado:modSelectedPlayer.playerevent.penalErrado,
            atajadas:modSelectedPlayer.playerevent.atajadas,
            figura:modSelectedPlayer.playerevent.figura,
            goles:modSelectedPlayer.playerevent.goles,
            golEnContra:modSelectedPlayer.playerevent.golEnContra,
            asistencias:modSelectedPlayer.playerevent.asistencias,
            pases:modSelectedPlayer.playerevent.pases,
            minutoInicial:modSelectedPlayer.playerevent.minutoInicial,
            minutoFinal:modSelectedPlayer.playerevent.minutoFinal,
            minutosJugadosApi:modSelectedPlayer.playerevent.minutosJugadosApi,
            minutosJugadosFantaya:modSelectedPlayer.playerevent.minutosJugadosFantaya,
            golesPost85:modSelectedPlayer.playerevent.golesPost85,
            golesPost85Cambiaresultado:modSelectedPlayer.playerevent.golesPost85Cambiaresultado,
            golesFueraarea:modSelectedPlayer.playerevent.golesFueraarea,
            asistPost85: modSelectedPlayer.playerevent.asistPost85,
            liderPases: modSelectedPlayer.playerevent.liderPases,
            FPJugado:modSelectedPlayer.playerevent.FPJugado,
            FPResultado:modSelectedPlayer.playerevent.FPResultado,
            FPTarjetas:modSelectedPlayer.playerevent.FPTarjetas,
            FPPases:modSelectedPlayer.playerevent.FPPases,
            FPGoles:modSelectedPlayer.playerevent.FPGoles,
            FPAsistencias:modSelectedPlayer.playerevent.FPAsistencias,
            FPArquero:modSelectedPlayer.playerevent.FPArquero,
            FPPenales:modSelectedPlayer.playerevent.FPPenales,
            FPInvicta:modSelectedPlayer.playerevent.FPInvicta,
            FPFigura:modSelectedPlayer.playerevent.FPFigura,
            FantaPuntos:modSelectedPlayer.playerevent.fantapuntos,
            FPDescripcion:modSelectedPlayer.playerevent.FPDescripcion,
            vallaInvicta:modSelectedPlayer.playerevent.vallaInvicta,
        }] 


        setAllPlayers(newPlayers)
        savePlayersEvents(cleanedToDB,selections.fixture)
    
      }


    const closePopup = ()=>{
        setShowPopUp(false)
    }




    return (
        <div className="main-component">
            <div className='pointeditor-selections'>
            {allSeasons && 
                <SeasonFixtureFilters 
                    fixtures={fixtures}
                    seasons={allSeasons}
                    selections={selections}
                    setSelections={setSelections}
                    className='squad-selections'
                />
            }
        {allPlayers && 
            <div className='filters'>
                    <Selector
                        options={allRealTeams}
                        selectedOption={selections.realTeam}
                        setSelectedOption={(option) => setSelections({...selections, realTeam:option})}
                        defOption='Todos los Equipos'
                        />
                    <Selector
                        options={allPositions}
                        selectedOption={selections.position}
                        setSelectedOption={(option) => setSelections({...selections, position:option})}
                        defOption='Todas las Posiciones'
                        />
            </div>
        }
                </div>

        {filteredPlayers && 
            
            <table className='squad-table pointeditor-table'>
                <thead className='squad-header-container'>
                    
                    <tr className='squad-headers'>
                        <th>Equipo</th>
                        <th>Jugador</th>
                        <th>Posición</th>
                        <th className='squad-division-coslumn'>FantaPuntos</th>
                    </tr>
                </thead>

                <tbody className='squad-info'>
                    {filteredPlayers.map(player => {
                        const playerPic = `${URL}players/${player.realTeamID}.png` 
                    
                    return (
                    <tr key={player.id} className='squad-info-row' onClick={() => handlePlayerClick(player)}>
                        <td>
                            <img 
                                src={playerPic || `${URL}TeamsLogos/genericPlayer.png`} 
                                className='realTeam-pic'
                                onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = `${URL}players/genericPlayer.png`;
                                }}
                        />
                        </td>
                        <td>{player.name}</td>
                        <td>{player.position}</td>
                        <td>{player.playerevent?.fantapuntos || 0}</td>


                    </tr>
                    )}
                    )}
                </tbody>
            </table>
        }

        {/* Popup Overlay */}
        {showPopup && popUpPlayer && 

            <PlayerInfo data={popUpPlayer.info} onClose={closePopup} fantayaSetter={handleUserEdits} />

        }
            



        </div>
    );
};

export default PointsEditor;
