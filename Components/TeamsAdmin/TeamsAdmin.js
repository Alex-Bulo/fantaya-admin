import React, { useState, useEffect } from 'react';

import './TeamsAdmin.css';
import { getTeams, updateDuplas, updateTeams } from '../../callDB';
import MatchRowForm from '../MatchRowForm';



function TeamsAdmin() {
    const today = new Date().toISOString().split('T')[0]
    
    const teamsFields = [
        {name:'active',type:'checkbox', checked: true, title:'Activo'}, 
        {name:'name',type:'text', placeholder:'Nombre de la franquicia', title:'Nombre de la franquicia'}, 
        {name:'division',type:'text', placeholder:'Categoria', title:'Categoria'}, 
        {name:'grupo',type:'text', placeholder:'Grupo', title:'Grupo torneo zonas'}, 
        {name:'createdAt',type:'date', value: today, placeholder:'Fecha de Creación', title:'Fecha de Creación'}
    ]

    const initialDuplasFields = [
        {name:'equipoDupla',type:'text', disabled:true, placeholder:'Nombre Dupla', title:'Nombre Dupla'}, 
        {name:'homeTeam',type:'text', placeholder:'Equipo 1', title:'Equipo 1'}, 
        {name:'awayTeam',type:'text', placeholder:'Equipo 2', title:'Equipo 2'}, 
    ]




    const [teams, setTeams] = useState(null)
    const [filteredTeams, setFilteredTeams] = useState(null)
    const [divisions, setDivisions] = useState(null)
    const [divisionSelection , setDivisionSelection] = useState('All')
    
    const [activeSelection , setActiveSelection] = useState(true)

    const [duplasTeams, setDuplasTeams] = useState(null)
    const [singlesTeams, setSinglesTeams] = useState(null)


    useEffect(()=>{
        // api/fantaya/seasons
        const fetchData = async () => {
            try {
                const data = await getTeams(0)                

                const teamsData = data.length>0 ? data.sort((a,b) => a.division.localeCompare(b.division)) : data
                setTeams(teamsData)
                

                if(activeSelection){
                    const activeTeams = teamsData.filter(t => t.active).sort((a,b) => a.division.localeCompare(b.division))
                    const divisionTeams = divisionSelection !== 'All' ? activeTeams.filter(t => t.division ===divisionSelection) : activeTeams
                    
                    setFilteredTeams(divisionTeams)
                    
                }else{
                    const divisionTeams = divisionSelection !=='All' ? teamsData.filter(t => t.division ===divisionSelection) : teamsData
                    
                    setFilteredTeams(divisionTeams)
                }

                const myDivisions = [...new Set(teamsData.map(t => t.division))]
                
                setDivisions(myDivisions)
                
                const excludesIncative_duplas = teamsData.filter(t=> t.active && t.division!=='Duplas')
                const excludesIncative_singles = teamsData.filter(t=> t.active && t.division==='Duplas').map(t=> {
                    t.equipoDupla = t.name
                    t.homeTeam = t.dupla?.teamA ||''
                    t.homeTeamId = t.dupla?.idTeamA ||''
                    t.awayTeam = t.dupla?.teamB ||''
                    t.awayTeamId = t.dupla?.idTeamB ||''
                    return t
                })

                setSinglesTeams(excludesIncative_duplas)
                setDuplasTeams(excludesIncative_singles)



            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };
        
        fetchData();

        
        
      
    },[])

    
    const handleSaveTeams = async (formRows)=>{
        
        const newTeams = await updateTeams(formRows)

        setTeams(newTeams)        

    }

    const activeFilterChange = (e) =>{

        let userTeams =[]
        if (e==='Active'){
            userTeams = teams.filter(t => t.active)
        }else{
            userTeams = teams
        }
        
        setActiveSelection(e)
        setFilteredTeams(userTeams)

    }
    const divisionFilterChange = (e) =>{
        
        setDivisionSelection(e)

        const updatedTeams = e !=='All' ? teams.filter(t => t.division === e).filter(t=> activeSelection ==='Active' ? t.active : t ) : teams.filter(t=> activeSelection ==='Active' ? t.active : t)

        setFilteredTeams(updatedTeams)

    }

    const handleDuplasTeams = async (formRows)=>{

        const cleanedForDB = formRows.map(t => {
            const dupla ={
                idTeam : t.id,
                idTeamA : singlesTeams.find(sTeam=> sTeam.name === t.homeTeam)?.id||'',
                idTeamB : singlesTeams.find(sTeam=> sTeam.name === t.awayTeam)?.id||''
            }

            return dupla
        })

        
        const newTeams = await updateDuplas(cleanedForDB)
        

    }



  return (
    teams && singlesTeams && divisions &&
        <section className='season-structure'>

            <article className='group-container'>    
                <h4 className='group-title'>Equipos</h4>    
                <select className='group-filter' value={activeSelection} onChange={(e) => activeFilterChange(e.target.value)}>
                    <option value={'Active'}>Activos</option>
                    <option value={'All'}>Todos</option>
                </select>

                <select className='group-filter' value={divisionSelection} onChange={(e) => divisionFilterChange(e.target.value)}>
                    <option value={'All'}>Todos</option>
                    {
                        divisions.map(d =>
                            <option value={d}>{d}</option>
                        )
                    }
                </select>

                { filteredTeams && <MatchRowForm initialData={filteredTeams} fields={teamsFields} onSubmit={handleSaveTeams} /> }
            </article>

            <article className='group-container'>    
                <h4 className='group-title'>Asociar Duplas</h4>    

                { singlesTeams && <MatchRowForm initialData={duplasTeams} fields={initialDuplasFields} onSubmit={handleDuplasTeams} teams={singlesTeams} enableNewRow={false}/> }
            </article>

            </section>
    
  )
}

export default TeamsAdmin;
