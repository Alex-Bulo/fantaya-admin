import React from 'react';


function FixtureSelector ({ fixtures, selectedFixture, setSelectedFixture }) {
    
    
    return (
        <select value={selectedFixture} onChange={(e) => setSelectedFixture(e.target.value)}>
            <option value="">Elegir Fecha</option>

            {fixtures.map(fixture => (
                <option key={fixture.id} value={fixture.id}>Fecha {fixture.fantayaFecha}</option>
            ))}

        </select>
    );

} 



export default FixtureSelector;
