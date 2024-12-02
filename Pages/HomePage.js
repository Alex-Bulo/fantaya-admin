import React from 'react';

import './HomePage.css';
import { Link } from 'react-router-dom';


function HomePage() {



  return (  
      <section className='HomeMenu'>
        
        <Link to="/teams">Administrar Equipos</Link>
        <Link to="/seasons">Administrar Torneos</Link>
        <Link to='/matches'>Administrar Partidos</Link>
     
      
      </section>

  );
}

export default HomePage;
