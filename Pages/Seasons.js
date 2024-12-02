import React, { useState } from 'react';


import FantayaStanding from '../Components/SeasonAdmin/FantayaStandings';
import SeasonStructure from '../Components/SeasonAdmin/SeasonStructure';
import FreePick from '../Components/SeasonAdmin/FreePick';


function Seasons() {

    const [selected, setSelected] = useState({
        structure:false,
        standings:false,
    })

    const handleClick = (key) => {
        
        setSelected((prevSelected) => ({
            structure: key === 'structure' ? !prevSelected.structure : false,
            standings:key === 'standings' ? !prevSelected.standings : false,
            picks:key === 'picks' ? !prevSelected.picks : false,
        }))
    }
    

  return (
    <div className='page-container'>
      <section className='sidebar'>
        <h3 className='sidebar-title'>Torneos</h3>
        <article className={`sidebar-option ${selected.structure && 'selected'}`} onClick={()=>handleClick('structure')}>Crear</article>
     
        <article className={`sidebar-option ${selected.standings && 'selected'}`} onClick={()=>handleClick('standings')}>Posiciones</article>

        <article className={`sidebar-option ${selected.picks && 'selected'}`} onClick={()=>handleClick('picks')}>Orden Libres</article>

      </section>

        { selected.structure && 
            <SeasonStructure />
        }
        { selected.standings && 
            <FantayaStanding />
            // <SeasonStructure />
        }
        { selected.picks && 
            <FreePick />
            // <SeasonStructure />
        }

    </div>
  )
}

export default Seasons;
