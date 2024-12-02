import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import './App.css';
import FantayaLogo from './FantayaLogo.png'
import HomePage from './Pages/HomePage';
import Seasons from './Pages/Seasons';
import Teams from './Pages/Teams';
import Matches from './Pages/Matches';



function App() {

  return (  
    
      <main className="Fantaya">
          <nav className="navbar">
            <div className="navbar-logo">
              <Link to='/'><img src={FantayaLogo} alt="Fantaya League Logo" /> </Link>
          </div>
          <div className="nav-links">
              <Link to="/teams">Equipos</Link>
              <Link to="/seasons">Torneos</Link>
              <Link to="/matches">Partidos</Link>
        </div>
      </nav>
  
          <Routes>
  
            <Route path="/"                     element={ <HomePage />          } />
            <Route path="/seasons"              element={ <Seasons />           } />
            <Route path="/teams"                element={ <Teams />             } />
            <Route path="/matches"              element={ <Matches />           } />
          </Routes>
  
        </main>

  );
}

export default App;
