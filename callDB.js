import { API_URL } from "./helper"



// exposed functions


////// gets //////
export async function getTeamCards ({idTeam,idFixture}){

  try{
    const response = await fetch(`${API_URL}fantaya/tarjetas/${idTeam}/${idFixture}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const teamCards = await response.json()
    
    return teamCards.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getCardsByFixture (idFixture){

  try{
    const response = await fetch(`${API_URL}fantaya/tarjetas/${idFixture}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const cards = await response.json()
    
    return cards.data






  } catch (error) {
    console.log(error);
        
  }

}

export async function getFixture (idSeason){

  try{
    // MANUAL IDSEASON
    // idSeason = 10
    const response = await fetch(`${API_URL}fantaya/fixture/${idSeason}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const fixtures = await response.json()

    return fixtures.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getTeams (active=1){

  try{
    const response = await fetch(`${API_URL}fantaya/teams/${active}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const teams = await response.json()

    
    return teams.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getPremierePlayers (){

  try{
    const response = await fetch(`${API_URL}players`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const players = await response.json()    
    
    return players.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getMatches (fixture=null){

  try{
    const response = await fetch(`${API_URL}fantaya/matches/${fixture}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
    
    const matches = await response.json()

    
    return matches.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getSeasonsWithDetails (){
  try {



    const response = await fetch(`${API_URL}fantaya/seasons`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
        
    const allSeasons = await response.json()
    
    return allSeasons.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getEventsByFixture (fixture){
  try {

    const response = await fetch(`${API_URL}events/${fixture}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
        
    const events = await response.json()
    
    return events.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function getStandingByFixture (season){
  try {

    const response = await fetch(`${API_URL}fantaya/standings/${season}`,{
      headers:{'Content-Type':'application/json'},
      method:'get'
    })
        
    const info = await response.json()
    
    return {standings: info.standings, fixtures: info.fixtures}

  } catch (error) {
    console.log(error);
        
  }

}


////// posts //////
export async function savePlayersEvents (data=[],fixture){

  try {
    
    if(!fixture||data.length===0){
      throw new Error("No fixture and/or data to save")      
    }
    
    const modData = data.map(i => {
      i.idFixture = fixture
      i.idPlayer= i.id
      return i
    })

    
      
    const response = await fetch(`${API_URL}events`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({playerevents: modData})
    })
    
    const newEvents = response.json()
    

    return newEvents
  } catch (error) {
    console.log(error);
        
  }
  
}

export async function updatePlayersDBInfo (data=[]) {

  try {
    
    const response = await fetch(`${API_URL}players`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({playersToAdd: data})
    })
    
    const newPlayers = response.json()
  
    return newPlayers

  } catch (error) {
    console.log(error);
        
  }


}

export async function updateCardPointsAndMatch (cardData,matchData){

  try {
    
    
    const responseCard = await fetch(`${API_URL}fantaya/cardPoints`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({cPoints: cardData})
    })
    
    const responseMatch = await fetch(`${API_URL}fantaya/matchResult`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({matchResult: [matchData]})
    })
    
    const newFPoints = await responseCard.json()
    const newMatch = await responseMatch.json()     
  
    return newFPoints

  } catch (error) {
    console.log(error);
        
  }

}
export async function updateCardPointsAndMatchmultiple (cardData,matchData){

  try {

    
    
    const responseCard = await fetch(`${API_URL}fantaya/cardPoints`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({cPoints: cardData})
    })
    
    const responseMatch = await fetch(`${API_URL}fantaya/matchResultmultiple`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({matchResult: matchData})
    })
    
    const newFPoints = await responseCard.json()
    const newMatch = await responseMatch.json()     
  
    return newFPoints

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateSeasons (data){

  try {



    const response = await fetch(`${API_URL}fantaya/seasons`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({seasons: data})
    })
    
    
    const newSeasons = await response.json()
  
    return newSeasons.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateFixtures (data){

  try {



    const response = await fetch(`${API_URL}fantaya/fixtures`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({fixtures: data})
    })
    
    
    const newFixtures = await response.json()
  
    return newFixtures.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateMatches (data){

  try {



    const response = await fetch(`${API_URL}fantaya/matches`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({matches: data})
    })
    
    
    const newSeasons = await response.json()
  
    return newSeasons.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateMatchesmultiple (data){

  try {



    const response = await fetch(`${API_URL}fantaya/matchesmultiple`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({matches: data})
    })
    
    
    const newSeasons = await response.json()
  
    return newSeasons.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateTeams (data){

  try {



    const response = await fetch(`${API_URL}fantaya/teams`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({teams: data})
    })
    
    
    const newTeams = await response.json()
  
    return newTeams.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function updateDuplas (data){

  try {



    const response = await fetch(`${API_URL}fantaya/duplaTeams`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({duplas: data})
    })
    
    
    const newDuplas = await response.json()
  
    return newDuplas.data

  } catch (error) {
    console.log(error);
        
  }

}

export async function saveSquads(data,division){

  try {

    const response = await fetch(`${API_URL}fantaya/squads/${division}`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({squads: data})
    })
    
    
    const newSquads = await response.json()
  
    return newSquads.data

  } catch (error) {
    console.log(error);
        
  }
}


export async function saveRankings (data){
  try {

    const response = await fetch(`${API_URL}fantaya/standings`,{
      headers:{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify({rankings: data})
    })
    
    
    const newStandings = await response.json()
  
    return newStandings.data

  } catch (error) {
    console.log(error);
        
  }


}