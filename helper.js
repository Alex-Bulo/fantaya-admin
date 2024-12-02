import moment from 'moment'

export const URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/' : 'http://fantaya.duckdns.org/'
export const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3002/api/' : 'http://apifantaya.duckdns.org/'

export const iconDictionary = {

    minutosJugadosFantaya: 'fas fa-clock jugado-icon' ,
    figura: 'fas fa-star mvp-icon' ,
    vallaInvicta: 'fas fa-shield-halved',
    liderPases: 'fa-regular fa-star maxPass-icon' ,
    asistencias: '' ,
    assistPost85: '',
    pases: '' ,
    goles: 'fas fa-futbol goals-icon',
    golEnContra: 'fas fa-regular fa-circle-xmark ownGoal-icon' ,
    golesFueraArea: 'Gol fuera del área',
    golesPost85: '' ,
    golesPost85CambiaResultado: "Gol post85' Cambia Resultado" ,
    penalGol: 'fas fa-futbol pk-icon',
    penalErrado: 'fas fa-futbol missedpk-icon',
    penalAtajado: 'fas fa-hands savedpk-icon',
    atajadas: 'fas fa-hands saves-icon',
    golesRecibidos: 'fas fa-futbol conceded-icon' ,
    amarillas: 'fas fa-square yellowCard-icon' ,
    rojas: 'fas fa-square redCard-icon',
    fpResultado: '',

}

export const normalizeDate = (timestamp) => {
 return moment(timestamp).fromNow()
}

export function sortByLastDate(arr, dateKey) {
   
    return arr.sort((a, b) => moment(a[dateKey]).diff(moment(b[dateKey])));
}


export function groupByProperty(arr, key) {
    // Use reduce to group the array
    const grouped = arr.reduce((result, item) => {
        // Get the value of the key to group by
        const groupKey = item[key];
        // Initialize the group if it doesn't exist
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        // Push the current item to the corresponding group
        result[groupKey].push(item);
        return result;
    }, {});

    return grouped;
}

export function formatDate_DayNumTime (date) {
    return date ? moment(date).format("dddd Do HH:mm") : "";
  };
export function addMinutesToDate (date,minutesToAdd) {
    return date ? moment(date).add(minutesToAdd, "minutes") : "";
  };