import React, { useState, useEffect } from 'react';

import './SeasonStructure.css';
import { getSeasonsWithDetails, getTeams, updateFixtures, updateMatches, updateMatchesmultiple, updateSeasons } from '../../callDB';
import MatchRowForm from '../MatchRowForm';



function SeasonStructure() {
    const seasonFields = [
        {name:'active',type:'checkbox', title:'En curso'}, 
        {name:'name',type:'text', placeholder:'Nombre del torneo', title:'Nombre de torneo'}, 
        {name:'type',type:'text', placeholder:'Tipo de torneo', title:'Tipo de torneo'}, 
        {name:'startDate',type:'date', placeholder:'Fecha inicio', title:'Fecha Inicio'}, 
        {name:'endDate',type:'date', placeholder:'Fecha fin', title:'Fecha Fin'}, 
    ]

    const initialfixtureFields = [
        {name:'temporada',type:'text', disabled:true, placeholder:'Temporada', title:'Temporada Elegida'}, 
        {name:'fantayaFecha',type:'number', placeholder:'Numero de fecha', title:'Fecha Fantaya'}, 
        {name:'startDate',type:'date', placeholder:'Fecha inicio', title:'Fecha Inicio'}, 
        {name:'endDate',type:'date', placeholder:'Fecha fin', title:'Fecha Fin'}, 
    ]

    const initialMatchFields = [
        // {name:'idFixture',type:'number', placeholder:'Fecha id'}, 
        {name:'homeTeam',type:'text', placeholder:'Local', title:'Local'}, 
        {name:'awayTeam',type:'text', placeholder:'Visitante', title:'Visitante'}, 
        {name:'team3',type:'text', placeholder:'Equipo 3', title:'Eq 3'},     
        {name:'team4',type:'text', placeholder:'Equipo 4', title:'Eq 4'},     
        {name:'team5',type:'text', placeholder:'Equipo 5', title:'Eq 5'},     
        {name:'team6',type:'text', placeholder:'Equipo 6', title:'Eq 6'},     
        {name:'team7',type:'text', placeholder:'Equipo 7', title:'Eq 7'},     
        {name:'team8',type:'text', placeholder:'Equipo 8', title:'Eq 8'},     
        {name:'team9',type:'text', placeholder:'Equipo 9', title:'Eq 9'},     
        {name:'team10',type:'text', placeholder:'Equipo 10', title:'Eq 10'}     
    ]

    const [seasons, setSeasons] = useState(null)
    const [filteredSeason, setFilteredSeason] = useState(null)

    
    const [fixtures, setFixtures] = useState(null)
    const [filteredFixture, setFilteredFixture] = useState(null)
    const [fixtureFields, setFixtureFields] = useState(initialfixtureFields)
    
    const [filteredMatches, setFilteredMatches] = useState(null)
    const [matchFields, setMatchesFields] = useState(initialMatchFields)

    const [teams, setTeams] = useState(null)



    useEffect(()=>{
        // api/fantaya/seasons
        const fetchData = async () => {
            try {
                const seasonsData = await getSeasonsWithDetails() 
                const teamsData = await getTeams(1)
                
                setSeasons(seasonsData);

                const activeTeams = teamsData.filter(t => t.active).sort((a,b) => a.division.localeCompare(b.division))
                setTeams(activeTeams)

                setFixtures(seasonsData.flatMap(s => s.fixture))
                setFilteredSeason([
                    {name:'name',type:'text', value:'', placeholder:'Nombre del torneo'}, 
                    {name:'type',type:'text', value:'',placeholder:'Tipo de torneo'}, 
                    {name:'active',type:'checkbox', value:'',}, 
                    {name:'startDate',type:'date', value:'', placeholder:'Fecha inicio'}, 
                    {name:'endDate',type:'date', value:'', placeholder:'Fecha fin'},
                ])

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        fetchData();
        
        
      
    },[])

    const seasonFilterChange = (e) =>{

        const newSelectedSeason = seasons.find(s => s.id == e)
       
        setFilteredSeason(newSelectedSeason)
        
        //// filtrar fixtures x season selected
        let fixtureBySeason = newSelectedSeason.fixture

        fixtureBySeason = fixtureBySeason.map(f => {
            f.temporada = newSelectedSeason.name
            return f
        })


        setFixtures(fixtureBySeason)

        const modfFields = fixtureFields.map(ff => {
            if(ff.name==='idSeason'){
                ff.value = e
            }
            if(ff.name==='temporada'){
                ff.value = newSelectedSeason.name
            }
            return ff
        })
        
        setFixtureFields(modfFields)
        setFilteredMatches(null)

    }
    
    const handleSaveSeason = async (formRows)=>{
        
        const newSeasons = await updateSeasons(formRows)
        
        setSeasons(newSeasons)
        
        if(formRows.length > filteredSeason.length){
            const newSeason = newSeasons[newSeasons.length -1]
            setFilteredSeason(newSeason)
        }

    }


    
    const handleSaveFixtures = async (formRows)=>{


        const cleanedForDB = formRows.map(row =>{
            
            if(!row.idSeason){
                row.idSeason = filteredSeason.id
            }
            
            delete row.temporada
            return row
        })
        
        const newSeasons = await updateFixtures(cleanedForDB)
        
        setSeasons(newSeasons)
        
    }

    const matchFilterChange = (e) =>{

        const newSelectedFixture = filteredSeason.fixture.find(f => f.id == e)
        setFilteredFixture(e)
       

        const modFilteredMatches = newSelectedFixture.matches.map(match => {
            match.idFixture = e
            match.homeTeam = match.teamHome.name
            match.awayTeam = match.teamAway.name
            
            // match.winnerDetail = match.winner === 'home' ? match.teamHome.name : match.winner === 'away' ? match.teamAway.name : 'Empate'

            return match
        })
        const modFilteredMatchesmultiple = newSelectedFixture.matchesmultiple?.map( (match,idx) => {
            const matchmultiple = {
                idFixture : e,
                [`${idx===0? 'idTeamHome': idx===1?'idTeamAway':'idTeam'+(idx+1)}`] : match.team.id,
                [`${idx===0? 'homeTeam': idx===1?'awayTeam':'team'+(idx+1)}`] : match.team.name
            }

            
            // match.winnerDetail = match.winner === 'home' ? match.teamHome.name : match.winner === 'away' ? match.teamAway.name : 'Empate'

            return matchmultiple
        }).reduce((result, current) => {
            return { ...result, ...current };
        }, {});


        setFilteredMatches([...modFilteredMatches, modFilteredMatchesmultiple])
        

        setMatchesFields(initialMatchFields)
        
    }

    const handleSaveMatches = async (formRows)=>{
        const withMultiple = formRows.filter(match => match.team3)
        const noMultiple = formRows.filter(match => !match.team3)
        
        if(noMultiple.length > 0){

            const cleanedForDB = noMultiple.map(match =>{
    
                if(match.idTeamAway){
                    // match.idFixture = fixtures.id
                    delete match.teamAway
                    delete match.teamHome
                    delete match.createdAt
                    delete match.updatedAt
                    delete match.winnerDetail
                    delete match.homeTeam
                    delete match.awayTeam
                }else{
                    match.idFixture = filteredFixture
                    match.idTeamAway = teams.find(t => t.name === match.awayTeam).id
                    match.idTeamHome = teams.find(t => t.name === match.homeTeam).id
                    // match.winner = match.winnerDetail
    
                    delete match.homeTeam
                    delete match.awayTeam
    
                }
    
                return match
                
            })
    
            await updateMatches(cleanedForDB)
        }

        if(withMultiple.length > 0){

            const cleanedForDB = withMultiple.map((match,idx) =>{
                
                const t1 = match.homeTeam ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.homeTeam).id} : null
                const t2 = match.homeTeam ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.awayTeam).id} : null
                const t3 = match.team3 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team3).id} : null
                const t4 = match.team4 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team4).id} : null
                const t5 = match.team5 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team5).id} : null
                const t6 = match.team6 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team6).id} : null
                const t7 = match.team7 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team7).id} : null
                const t8 = match.team8 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team8).id} : null
                const t9 = match.team9 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team9).id} : null
                const t10 = match.team10 ? {match:idx+1,idFixture: filteredFixture, idTeam:teams.find(t => t.name === match.team10).id} : null

                return [t1,t2,t3,t4,t5,t6,t7,t8,t9,t10]
                
            }).flat().filter(m => m !==null)
            
            
            await updateMatchesmultiple(cleanedForDB)
        }



        
    }

  return (
    <section className='season-structure'>

        { seasons &&
            <article className='group-container'>    
                <h4 className='group-title'>Temporadas Fantaya</h4>    

                <MatchRowForm initialData={seasons} fields={seasonFields} onSubmit={handleSaveSeason} />
            </article>
        }

        { (seasons) &&
            <article className='group-container'>
                <select className='group-filter' value={filteredSeason?.id} onChange={(e) => seasonFilterChange(e.target.value)}>
                    <option value="">Elegir Torneo</option>

                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}

                </select>
                <h4 className='group-title'>Fechas por Temporada</h4>          
                { fixtures && <MatchRowForm initialData={fixtures} fields={fixtureFields} onSubmit={handleSaveFixtures} /> }
            </article>
        }

        { (filteredSeason && filteredSeason[0]?.name !== 'name') &&
            <article className='group-container'>  
                <h4 className='group-title'>Partidos por Fecha</h4>       
                <select className='group-filter' value={fixtures?.fantayaFecha} onChange={(e) => matchFilterChange(e.target.value)}>
                    <option value="">Elegir Fecha</option>

                    {fixtures.map(fixture => (
                        <option key={fixture.id} value={fixture.id}>{fixture.fantayaFecha} de {fixture.startDate} a {fixture.endDate}</option>
                    ))}

                </select>

                { filteredMatches && <MatchRowForm initialData={filteredMatches} fields={matchFields} onSubmit={handleSaveMatches}  teams={teams}/> }
            </article>
        }




    </section>
  )
}

export default SeasonStructure;
