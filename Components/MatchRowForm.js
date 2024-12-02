import React, { useState, useEffect } from 'react';
import './MatchRowForm.css'

const MatchRowForm = ({ initialData = [], fields, onSubmit, teams, enableNewRow=true }) => {
  const [formRows, setFormRows] = useState([]);
  

  useEffect(() => {
    
    setFormRows(initialData);
    
  }, [initialData]);
  
  const addRow = () => {     
    
    const emptyRow = fields.reduce((row, field) => {
      
      row[field.name] = field.type === 'checkbox' ? field.checked : field.value||'';
      
      return row;
    }, {});

    
    setFormRows([...formRows, emptyRow]);
  }
  
  const deleteRow = (index) => {
    setFormRows(formRows.filter((_, rowIndex) => rowIndex !== index));
  }

  const handleInputChange = (index, fieldName, value) => {
    
    const updatedRows = formRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [fieldName]: value } : row
  );

  setFormRows(updatedRows);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    
    onSubmit(formRows);
  };

  return (
    <div className='form-wrapper'>
      <form className='group-form' onSubmit={handleFormSubmit}>
        {formRows.map((row, index) => {
          
          const fieldKeys = ['homeTeam', 'awayTeam', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8', 'team9', 'team10']

          
          return(
            <div key={index} className='form-row'>
              
              {fields.map((field,i) => {
                const isTeam =  field.name === 'homeTeam' || 
                                field.name === 'awayTeam' ||
                                field.name === 'team3' ||
                                field.name === 'team4' ||
                                field.name === 'team5' ||
                                field.name === 'team6' ||
                                field.name === 'team7' ||
                                field.name === 'team8' ||
                                field.name === 'team9' ||
                                field.name === 'team10'
                
                const keysToFilter = fieldKeys.filter(key => key !== field.name);

                
                
                return (
                  <div key={field.name} className='form-field'>
                    { isTeam ? (
                        <div className='form-field-title'>

                          <select
                            className='form-field team-field'
                            value={row[field.name] || ''}
                            onChange={(e) => handleInputChange(index, field.name, e.target.value)}
                          >
                            <option value="">{field.placeholder}</option>
                            {teams
                              .filter((team) => keysToFilter.every(key => team.name !== row[key]) ) 
                              .map((team) => (
                                <option key={team.id} value={team.name}>
                                  {team.name}
                                </option>
                              ))}
                          </select>
                      </div>
                    ) : field.name === 'type' ?(
                      <div className='form-field-title'> {index===0&&field.title}
                        <select
                          className='form-field'
                          value={row[field.name] || ''}
                          onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                        >
                          <option value="">Tipo de Torneo</option>
                          { [{id:'Torneo',name:'Torneo'},{id:'Playoff',name:'Playoff'},{id:'Zonas',name:'Zonas'},{id:'Todos',name:'Todos'}].map((tType) => (
                              <option key={tType.id} value={tType.name}>
                                {tType.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    ): field.type === 'checkbox' ? (
                      <label> {index===0 &&field.title}
                        <input
                          className='form-field'
                          type="checkbox"
                          title={row[field.title] || ''}
                          checked={row[field.name] || false}
                          onChange={(e) => handleInputChange(index, field.name, e.target.checked)}
                        />
                      </label>
                    ) : (
                      <label> {index===0&&field.title}
                        <input
                          className='form-field'
                          type={field.type}
                          title={row[field.title] || ''}
                          value={row[field.name] || ''}
                          disabled={field.name==='temporada'||field.name==='equipoDupla'?true:false}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(index, field.name, e.target.value)}
                        />
                      </label>
                    )}
                  </div>
              )}
            )}

              <button type="button" className='delete-button' onClick={() => deleteRow(index)}>Borrar</button>
            </div>
          )
        })}
        {enableNewRow && <button type="button" className='add-button' onClick={addRow}>Agregar</button>}
        <button type="submit" className='submit-button'>Guardar</button>
      </form>
    </div>
  );
};

export default MatchRowForm;
