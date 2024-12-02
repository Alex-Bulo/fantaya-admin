import React from 'react';
import Selector from './Selector';
import FixtureSelector from './FixtureSelector';




const SeasonFixtureFilters = ({ fixtures, seasons, selections, setSelections }) => (


    <div className="filters">
    
            {seasons &&
                <Selector
                    options={seasons} 
                    selectedOption={selections.season}
                    setSelectedOption={(season) => setSelections({...selections, season})}
                    defOption='Elegir Temporada'
                />
            }
            <FixtureSelector
                fixtures={fixtures}
                selectedFixture={selections.fixture}
                setSelectedFixture={(fixture) => setSelections({...selections, fixture})}
                />
    
    
        </div>
)


export default SeasonFixtureFilters

    