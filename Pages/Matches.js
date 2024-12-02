import React, { useState } from 'react';
import PointsCalculator from '../Components/MatchesAdmin/PointsCalculator';
import FantayaMatches from '../Components/MatchesAdmin/FantayaMatches';
import PointsEditor from '../Components/MatchesAdmin/PointsEditor';





function Matches() {

    const [selected, setSelected] = useState({
        admin: false,
        events: false,
        modEvents: false
    })

    const handleClick = (key) => {
        
        setSelected((prevSelected) => ({
            admin: key === 'admin' ? !prevSelected.admin : false,
            events: key === 'events' ? !prevSelected.events : false,
            modEvents: key === 'modEvents' ? !prevSelected.modEvents : false,
        }))
    }
    

  return (
    <div className='page-container'>
      <section className='sidebar'>
        <h3 className='sidebar-title'>Partidos</h3>

        <article className={`sidebar-option ${selected.events && 'selected'}`} onClick={()=>handleClick('events')}>Calcular Puntos</article>

        <article className={`sidebar-option ${selected.admin && 'selected'}`} onClick={()=>handleClick('admin')}>Tarjetas</article>

        <article className={`sidebar-option ${selected.modEvents && 'selected'}`} onClick={()=>handleClick('modEvents')}>Modificar Puntos</article>

      </section>

        { selected.events && 
            <PointsCalculator />
        }

        { selected.admin && 
            <FantayaMatches />
        }

        { selected.modEvents && 
            <PointsEditor />
        }

    </div>
  )
}

export default Matches;
