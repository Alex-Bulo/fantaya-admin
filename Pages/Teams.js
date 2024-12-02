import React, { useState } from 'react';

import './Teams.css';
import TeamsAdmin from '../Components/TeamsAdmin/TeamsAdmin';
import Squads from '../Components/TeamsAdmin/Squads';



function Teams() {

    const [selected, setSelected] = useState({
        teams: false,
        users: false,
        squads: false,
    })

    const handleClick = (key) => {
        
        setSelected((prevSelected) => ({
            teams: key === 'teams' ? !prevSelected.teams : false,
            users: key === 'users' ? !prevSelected.users : false,
            squads: key === 'squads' ? !prevSelected.squads : false
        }))
    }
    

  return (
    <div className='page-container'>
      <section className='sidebar'>
        <h3 className='sidebar-title'>Equipos</h3>
        <article className={`sidebar-option ${selected.structure && 'selected'}`} onClick={()=>handleClick('teams')}>Administrar</article>
     
        <article className={`sidebar-option ${selected.admin && 'selected'}`} onClick={()=>handleClick('users')}>Usuarios</article>

        <article className={`sidebar-option ${selected.squads && 'selected'}`} onClick={()=>handleClick('squads')}>Planteles</article>
      </section>

        { selected.teams && 
                <TeamsAdmin />
        }

        { selected.users && 
            <>
                <div>Listado de usuarios y agregar</div>
                <div>Listado de equipos para agregar usuarios</div>
            </>
        }

        { selected.squads && 
          <Squads />
        }

    </div>
  )
}

export default Teams;
