import axios from 'axios'
import { FP_CalculateAllPoints, isInvicta, normalizePosition } from './dataManipulation';
import { updatePlayersDBInfo } from './callDB';
import { API_URL } from './helper';

const apiAuth = {
    method: 'GET',
    headers: {
      'x-apisports-key': 'CREAR DESDE API-FOOTBALL.COM'
    }
  }

// +++++++++++++++++++++++++++++++++++++   MATCH IDs   +++++++++++++++++++++++++++++++++++++ //

// API call to get matches/fixture ids and scores
async function callMatches(endpoint, options) {
  try {

    const apiResponse = await axios.request({
        ...apiAuth,
        url: `https://v3.football.api-sports.io/${endpoint}`,
        params: { league: options.league, season: options.season, date:options.date },
         
      })

    return apiResponse.data;    
  } catch (error) {
    console.error('Error calling API:', error.message);
    throw error;
  }
}

// function that retrieves fixtures from api and arranges info to be used
async function matchesIDs(league, season, date, matchesData = []) {
  try {
    const matches = await callMatches('fixtures', { league:league, season:season, date:date });

    let myMatches = matchesData.concat(matches.response);
    
    const data = myMatches.map(match => {

        return {
            id: match.fixture.id,
            home: match.teams.home.name,
            homeGoals: match.goals.home,
            away: match.teams.away.name,
            awayGoals: match.goals.away
        }

    })

    return data;

} catch (error) {
    console.error('Error fetching players data:', error.message);
    throw error;
  }
}

// +++++++++++++++++++++++++++++++++++++   MATCH DETAILS   +++++++++++++++++++++++++++++++++++++ //

// API call to get details from matches/fixture
async function callMatchDetails(endpoint, options) {
    try {
  
      const apiResponse = await axios.request({
          ...apiAuth,
          url: `https://v3.football.api-sports.io/${endpoint}`,
          params: { ids: options.ids },
           
        })
  
      const apiStatus = await axios.request({
          ...apiAuth,
          url: `https://v3.football.api-sports.io/status`,           
        })
        
      return {data:apiResponse.data, requestsRemaining: 100 - apiStatus.data.response.requests.current}    
    
    } catch (error) {
      console.error('Error calling API:', error.message);
      throw error;
    }
}
  
// function that retrieves fixtures details from api and arranges info to be used
async function matchInfo(id, details = []) {
try {
    // PEDIDO A LA BASE DE DATOS DE TODOS LOS JUGADORES CON SUS POSICIONES
    const playersDBRequest = await axios.request({
      url: `${API_URL}players`       
    })

    
    const FPPlayersDB = playersDBRequest.data.data
    
    const allPlayerIds = FPPlayersDB.filter(p=>p.id!==0).map(player => player.id);
    const missingInDB = []

    

    const matchDetails = await callMatchDetails('fixtures', { ids:id });
    

    let myDetails = details.concat(matchDetails.data.response);
    let playersData = []

    for (let i = 0; i < myDetails.length; i++) {
      
      let homeScore = 0
      let awayScore = 0
      const goals = myDetails[i].events.filter(item => {

        if(item.type === 'Goal'){

          const scoringTeam = item.team.id
          const isHomeTeam = scoringTeam === myDetails[i].teams.home.id
          
          const prevScore = homeScore === awayScore ? 'Tie' : homeScore > awayScore ? 'Home' : 'Away'
          
          if (isHomeTeam) {
            homeScore++;
          } else {
            awayScore++;
          }
          
          item.scoreboard = {home:homeScore,away:awayScore}
          
          const newScore = homeScore === awayScore ? 'Tie' : homeScore > awayScore ? 'Home' : 'Away'

          if (prevScore === newScore){
            item.scoreChange = false
          }else{
            item.scoreChange = true
          }
          item.scoreTeam = isHomeTeam ? 'home' : 'away'
          return item
        }

      });
      
      const ownGoals = myDetails[i].events.filter(item => item.detail === 'Own Goal');
      const substitutions = myDetails[i].events.filter(item => item.type === 'subst');

      let passLeader1 = 0
      let ratingLeader1 = 0
      myDetails[i].players[0].players.forEach( currentPlayer => {
        
        const pass = Number(currentPlayer.statistics[0].passes.accuracy) || 0
        const rating = Number(currentPlayer.statistics[0].games.rating) || 0
        
        if(pass > passLeader1){
          passLeader1 = pass
        }
        if(rating > ratingLeader1){
          ratingLeader1 = rating
        }

      })  

      let passLeader2 = 0
      let ratingLeader2 = 0
      myDetails[i].players[1].players.forEach( currentPlayer => {
        
        const pass = Number(currentPlayer.statistics[0].passes.accuracy) || 0
        const rating = Number(currentPlayer.statistics[0].games.rating) || 0
        
        if(pass > passLeader2){
          passLeader2 = pass
        }
        if(rating > ratingLeader2){
          ratingLeader2 = rating
        }

      })  
      

      const maxPass = passLeader1 >= passLeader2 ? passLeader1 : passLeader2
      const maxRating = ratingLeader1 >= ratingLeader2 ? ratingLeader1 : ratingLeader2

     

      const startIXs = myDetails[i].lineups.map(team => team.startXI.map(start => start.player.id)).flat()
      


      const matchInfo = myDetails[i].players.map(team => {
          const playerTeam = team.team.id          
          
          const teamAsPlayerStats = {
            id: FPPlayersDB.filter(fdb => fdb.name === team.team.name)[0].id,
            jugador: team.team.name,
            playerPosition: 'Equipo',
            home: playerTeam===myDetails[i].teams.home.id,
            amarillas: 0,
            rojas: 0,
            golesRecibidos: 0,
            penalAtajado: 0,
            penalGol: 0,
            penalErrado: 0,
            atajadas: 0,
            goles: playerTeam===myDetails[i].teams.home.id ? myDetails[i].goals.home : myDetails[i].goals.away,
            golEnContra: 0, 
            asistencias: 0,
            pases: 0, 
            minutoInicial: 0, 
            minutoFinal: 90, 
            minutosJugadosApi: 90,
            minutosJugadosFantaya: 90,
            golesPost85: 0, 
            golesPost85CambiaResultado: 0, 
            golesFueraArea: 0, 
            assistPost85: 0, 
            liderPases: 0,
            figura: 0,
          }
          const [teamFP,teamFPFinal]= FP_CalculateAllPoints({...teamAsPlayerStats, matchResult:myDetails[i].goals})
          const teamAsPlayer = {...teamAsPlayerStats, ...teamFP, ...teamFPFinal}
          
          const mappedPlayers = team.players.filter(p=>p.player.id !== 0).map(player => {
            
            const titular = startIXs.includes(player.player.id)
            
            const FPPosition = FPPlayersDB.filter(FPPlayer => FPPlayer.id === player.player.id)
            

            const allPlayers = [...myDetails[i].lineups[0].startXI,...myDetails[i].lineups[0].substitutes,...myDetails[i].lineups[1].startXI,...myDetails[i].lineups[1].substitutes]
            
            const playerPosition = FPPosition.length === 1 ? 
                              FPPosition[0].position : 
                              normalizePosition(allPlayers.filter(lineupPlayer => lineupPlayer.player.id === player.player.id)[0].player.pos)


            if(!allPlayerIds.includes(player.player.id)){
              
              missingInDB.push({
                id: player.player.id,
                name: player.player.name,
                fantayaName: player.player.name,
                realTeam: team.team.name,
                position: playerPosition,
                country: player.player.country || null
  
              })
            }
                  
            
            const playerGoals = goals.filter( goal => goal.player.id === player.player.id)
            let playerGoal85 = 0 
            let playerGoal85Change = 0

            playerGoals.forEach((goal) => {
              if(goal.time.elapsed >=85){
                playerGoal85 = playerGoal85 + 1
                
                playerGoal85Change = goal.scoreChange ? playerGoal85Change + 1 : playerGoal85Change

              }
            
            })
            
            const playerAssists = goals.filter( goal => goal.assist.id === player.player.id)
            let playerAssist85 = 0
            playerAssists.forEach(assist => {

              if(assist.time.elapsed >=85){
                playerAssist85 = playerAssist85 + 1
              }
            
            })

            
            let ingreso
            let egreso
            let ingresoReal
            let egresoReal
            const matchDuration = myDetails[i].fixture.status.elapsed + (myDetails[i].fixture.status.extra||0)
            // assist.id es quien ingresa al campo - player.id es quien sale del campo           
            const subbed = substitutions.filter ( sub => sub.assist.id === player.player.id || sub.player.id === player.player.id)
            
            if(titular){

              if(subbed.length===0){
                ingreso = 0
                ingresoReal = {elapsed:0, extra:null}

                egreso = 90
                egresoReal = {elapsed:90, extra:  matchDuration - 90}
              }else{
                ingreso = 0
                ingresoReal = {elapsed:0, extra:null}

                egreso = subbed[0].time.elapsed
                egresoReal = subbed[0].time
              }

            }else{

              
              if(subbed.length === 0){
                ingreso = 0
                ingresoReal = {elapsed:0, extra:null}
                
                egreso = 0
                egresoReal = {elapsed:0, extra:null}
              }else{
                ingreso = subbed[0].time.elapsed
                ingresoReal = subbed[0].time

                if(subbed.length === 1){
                  egreso = 90
                  egresoReal = {elapsed:90, extra: (matchDuration - 90)}
                }else{

                  egreso = subbed[1].time.elapsed
                  egresoReal = subbed[1].time
                }
              }
            }
            

            const playerPasses = Number(player.statistics[0].passes.accuracy) || 0

            const playerStats = {
              id: player.player.id,
              realTeamName: team.team.name,
              jugador: player.player.name,
              playerPosition:playerPosition === undefined ? normalizePosition('G') : playerPosition ,
              home:playerTeam===myDetails[i].teams.home.id,
              amarillas: player.statistics[0].cards.yellow,
              rojas: player.statistics[0].cards.red,
              golesRecibidos: player.statistics[0].goals.conceded,
              penalAtajado: player.statistics[0].penalty.saved,
              penalGol: player.statistics[0].penalty.scored,
              penalErrado: player.statistics[0].penalty.missed,
              atajadas: player.statistics[0].goals.saves,
              goles: player.statistics[0].goals.total - player.statistics[0].penalty.scored,
              golEnContra : ownGoals.filter(event => event.player.name === player.player.name).length,
              asistencias: player.statistics[0].goals.assists,
              pases: playerPasses,
              minutoInicial: ingreso,
              minutoFinal: egreso,
              minutosJugadosApi: player.statistics[0].games.minutes,
              minutosJugadosFantaya: ingreso===90? 0.5 : egreso - ingreso,
              golesPost85: playerGoal85,
              golesPost85CambiaResultado: playerGoal85Change,
              golesFueraArea: 0,
              assistPost85: playerAssist85,
              liderPases: playerPasses === maxPass ? true : false,
              figura: (Number(player.statistics[0].games.rating) || 0) === maxRating ? true : false,
            }
              
            
            playerStats.vallaInvicta = isInvicta(
                {player:
                  { home: playerTeam === myDetails[i].teams.home.id, 
                    timeIn: playerStats.minutoInicial, 
                    timeOut:playerStats.minutoFinal,
                    timeInField:{in:ingresoReal, out:egresoReal},
                    pos:playerPosition},
                  goals:goals
                }
              )
            
            
            const [playerFP,FPFinal]= FP_CalculateAllPoints(playerStats)


            return {...playerStats, ...playerFP, ...FPFinal}
          })

          return [teamAsPlayer, ...mappedPlayers]
      })
      
      playersData.push(matchInfo);

    }

    if(missingInDB.length > 0){
      
      const addedPlayers = await updatePlayersDBInfo(missingInDB)
      
    }

    return {fantayaInfo:playersData, fixtureInfo:myDetails, apiRemaining: matchDetails.requestsRemaining}

} catch (error) {
    console.error('Error fetching players data:', error.message);
    throw error;
}
}




// +++++++++++++++++++++++++++++++++++++   MATCH PREDICTIONS   +++++++++++++++++++++++++++++++++++++ //

// API call to get match prediction information
async function callPredictions(endpoint, options) {
  try {

    const apiResponse = await axios.request({
        ...apiAuth,
        url: `https://v3.football.api-sports.io/${endpoint}`,
        params: options,
         
      })

    return apiResponse.data;    
  } catch (error) {
    console.error('Error calling API:', error.message);
    throw error;
  }
}

// function that retrieves predictions from api and arranges info to be used
async function predictionInfo(id) {
  try {
    const predictionData = await callPredictions('predictions', { fixture:id });

    let myPrediction = [].concat(predictionData.response);

    return myPrediction[0];

} catch (error) {
    console.error('Error fetching players data:', error.message);
    throw error;
  }
}





// exposed function. It has the dates to get matches and fixtures
export function getAllMatches (date){
    const apiLeague = '39'
    const apiSeason = '2024'

    return matchesIDs(apiLeague, apiSeason, date)
    
}


// exposed function. It has the IDs of matches from app
export async function getPlayersInfo (ids){

  return await matchInfo(ids.join('-'))
  
}

// exposed function. It has the IDs of matches from app
export async function getPredictionsInfo(ids) {
  
  let predictionsInfo = []

  for (let index = 0; index < ids.length; index++) {
    
    const prediction = await predictionInfo(ids[index])

    predictionsInfo.push(prediction)
    
  }

  return predictionsInfo

}

