import React from 'react';


function Selector ({ options, selectedOption, setSelectedOption, defOption='Elegir' }) {
    
    
    return (
        <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="">{defOption}</option>

            {options.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
            ))}

        </select>
    );

} 



export default Selector;
