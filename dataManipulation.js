
const percentageToNumber = (percent) => parseInt(percent.replace('%', ''));

export const normalizePosition = (pos) => {

    if(pos==='Arq' || pos==='Def' || pos==='Med' || pos==='Del'){
        return pos
    }else{

        if(pos==='G'){
            return 'Arq'
        }

        if(pos==='D'){
            return 'Def'
        }

        if(pos==='M'){
            return 'Med'
        }

        if(pos==='F'){
            return 'Del'
        }

    }


}

export const replaceObjectById = (array, target) => {
        
    for (let i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            // If the current element is an array, call recursively
            
            replaceObjectById(array[i], target);
        } else if (array[i].id === target.id) {
            // Replace the object if the id matches
            
            array[i] = target;
            return true; // Stop once replaced
        }
    }
    return false;
};

export function predictionManipulation_Radar (data){
    
    return {
            fixture: {
                home:{name:data.teams.home.name, logo: data.teams.home.logo},
                away:{name:data.teams.away.name, logo: data.teams.away.logo}
            },
            radar:[
                
                {
                    metric: 'Empates',
                    home: (data.teams.home.league.fixtures.draws.total / data.teams.home.league.fixtures.played.total) * 100,
                    away: (data.teams.away.league.fixtures.draws.total / data.teams.away.league.fixtures.played.total) * 100,
                    fullMark: 100
                },                
                {
                    metric: 'Derrotas',
                    home: (data.teams.home.league.fixtures.loses.total / data.teams.home.league.fixtures.played.total) * 100,
                    away: (data.teams.away.league.fixtures.loses.total / data.teams.away.league.fixtures.played.total) * 100,
                    fullMark: 100
                },
                {
                    metric: 'Defensa',
                    home: percentageToNumber(data.teams.home.last_5.def),
                    away: percentageToNumber(data.teams.away.last_5.def),
                    fullMark: 100
                },
                {
                    metric: 'Ataque',
                    home: percentageToNumber(data.teams.home.last_5.att),
                    away: percentageToNumber(data.teams.away.last_5.att),
                    fullMark: 100
                },
                {
                    metric: 'Victorias',
                    home: (data.teams.home.league.fixtures.wins.total / data.teams.home.league.fixtures.played.total) * 100,
                    away: (data.teams.away.league.fixtures.wins.total / data.teams.away.league.fixtures.played.total) * 100,
                    fullMark: 100
                }

            ],
            pieChart:{
                victoria:[
                    {name:data.teams.home.name, value:percentageToNumber(data.comparison.total.home), fill:"#ff4d4f", metric:'Prediccion Victoria' },
                    {name:data.teams.away.name, value:percentageToNumber(data.comparison.total.away), fill:"#ffcccd", metric:'Prediccion Victoria' }
                    
                ],
                forma:[
                    {name:data.teams.home.name, value:percentageToNumber(data.comparison.form.home), fill:"#696969", metric:'Forma'},
                    {name:data.teams.away.name, value:percentageToNumber(data.comparison.form.away), fill:'#c7c7c7', metric:'Forma'}  
                ],
                h2h:[
                    {name:data.teams.home.name, value:percentageToNumber(data.comparison.h2h.home), fill:"#ff4d4f", metric:'1v1 (ultimos 10)'},
                    {name:data.teams.away.name, value:percentageToNumber(data.comparison.h2h.away), fill:"#ffcccd", metric:'1v1 (ultimos 10)' }
                    
                ],

                eXGoal:[
                    {name:data.teams.home.name, value:percentageToNumber(data.comparison.poisson_distribution.home), fill:"#696969", metric:'Chances de Convertir' },
                    {name:data.teams.away.name, value:percentageToNumber(data.comparison.poisson_distribution.away), fill:"#c7c7c7", metric:'Chances de Convertir' }
                    
                ],
            }
        
    }

}

function FP_jugado (minutesPlayed){
    const minutes = Number(minutesPlayed) || 0
    return minutes<10 ? -1 : 0

}

function FP_tarjetas (cards={yellow:0,red:0}){
    const yellow = Number(cards.yellow) || 0
    const red = Number(cards.red) || 0
    return red > 0 ?  -4 : yellow >0 ? -1 : 0 

}

function FP_pases (passes={leader:'',amount:0}){
    const leaderPasses = passes.leader ? 3 : 0
    const passes100 = passes.amount >= 100 ? 1 : 0

    return leaderPasses + passes100

}

function FP_arquero (gk={saves:0,goals:0}){
    const saved = Number(gk.saves) || 0

    const goalsConceded = Number(gk.goals) || 0
    const FPReceived = goalsConceded * -1

    let FPSaves = 0
    if(saved >= 5){
        FPSaves = 2
    } 
    if(saved >= 10){
        FPSaves = 5
    } 
    
    return FPReceived + FPSaves
    
}

function FP_penales (penalties={missed:0,scored:0,saved:0}){
    const pkMissed = Number(penalties.missed) || 0
    const pkScored = Number(penalties.scored) || 0
    const pkSaved = Number(penalties.saved) || 0
 
    return pkMissed * -4 + pkScored * 3 + pkSaved * 6

}

function FP_goles (info={home:false, pos:'Del', goals:0, min85:0, min85change:0, outsideBox:0, ownGoal:0 }){
    
    const pos = normalizePosition(info.pos)
    let fPoints = 0

    const awayAdditional = info.home ? 0 : 2 
    const post85Additional = ( Number(info.min85) || 0 ) * 2
    const post85ChangeAdditional = ( Number(info.min85change) || 0 )  * 1
    const outsideBosAdditional = ( Number(info.outsideBox) || 0 )  * 2

    switch (pos) {
        case 'Arq':
          fPoints = (10 + awayAdditional) * info.goals 
          break;

        case 'Def':
            fPoints = (8 + awayAdditional) * info.goals
            break;
            
        case 'Med':
            fPoints  = (6 + awayAdditional) * info.goals
          break;

        case 'Del':
            fPoints  = (4 + awayAdditional) * info.goals
          break;
        default:
        fPoints = 0
      }
    
    const ownGoal = -4 * Number(info.ownGoal) || 0
      
    return fPoints + post85Additional + post85ChangeAdditional + outsideBosAdditional + ownGoal

}

function FP_asistencia (info={home:false, pos:'Del', assis:0, min85:0, min85change:0, outsideBox:0 }){
    
    const pos = normalizePosition(info.pos)
    let fPoints = 0

    const awayAdditional = info.home ? 0 : 1 
    const post85Additional = ( Number(info.min85) || 0 ) * 1

    switch (pos) {
        case 'Arq':
          fPoints = (5 + awayAdditional) * info.assis
          break;

        case 'Def':
            fPoints = (4 + awayAdditional) * info.assis
            break;
            
        case 'Med':
            fPoints  = (3 + awayAdditional) * info.assis
          break;

        case 'Del':
            fPoints  = (2 + awayAdditional) * info.assis
          break;
        default:
        fPoints = 0
      }

      
    return fPoints + post85Additional

}

export function isInvicta (info={player:{}, goals:{}}){

    if( (info.player.pos==='Arq' || info.player.pos === 'Def') && info.player.timeOut - info.player.timeIn >= 20){
        const timeInForGoals = info.player.timeInField.in.elapsed + ((info.player.timeInField.in.extra || 0) / 10)
        const timeOutForGoals = info.player.timeInField.out.elapsed + ((info.player.timeInField.out.extra || 0) / 10)
        
        const goalsPlayerIn = info.goals.filter(goal => {
            const goalTime = goal.time.elapsed + ((goal.time.extra || 0)/10)
            return goalTime > timeInForGoals && goalTime < timeOutForGoals;
        })
        

        if(info.player.home){
            
            return !goalsPlayerIn.some(item => item.scoreTeam === 'away')
        }else{

            return !goalsPlayerIn.some(item => item.scoreTeam === 'home')
        }
    
    }
    
    return false

}

function FP_invicta (info={player:{}, invicta:false}){
    
    if(info.player.pos === 'Arq' && info.invicta){
        return info.player.home ? 5 : 5+1
    }

    if(info.player.pos === 'Def' && info.invicta){
        return info.player.home ? 3 : 3+1
    }
    return 0

}

function FP_figura(figura) {
    return figura ? 3 : 0
}

function FP_resultado (info={home:true,goals:{home:0,away:0}}){
    const homeScore = info.goals.home
    const awayScore = info.goals.away
    

    let initialFP = 0
    let finalFP = 0

    if (homeScore === awayScore) {

        initialFP = 0
    } else {

        initialFP = 1 + Math.round(Math.abs(homeScore - awayScore) / 2) * 2
    }
    
    if(info.home){
        
        finalFP = homeScore >= awayScore ? initialFP : initialFP * -1
    }else{
        
        finalFP = awayScore >= homeScore ? initialFP + 1 : initialFP * -1

    }

    return finalFP

}

export function FP_descripcion(info){
      
    const descriptionHomeAway = info.home? 'de local' : 'de visitante'

    const descriptionPlayed = info.minutosJugadosFantaya === 0 ? 'No Jugó' : info.minutosJugadosFantaya < 10 ? 'Jugó menos de 10min' : null
    const descriptionYellow = info.amarillas > 0 ? 'Amarilla' : null
    const descriptionRed = info.rojas > 0 ? 'Roja' : null
    const descriptionConceded = info.golesRecibidos === 1 ? '1 gol recibido' : info.golesRecibidos>1 ? info.golesRecibidos + ' goles recibidos' : null
    const descriptionPkSaved = info.penalAtajado === 1 ? '1 penal atajado' : info.penalAtajado>1 ? info.penalAtajado + ' penales atajados' : null
    const descriptionPkScored = info.penalGol === 1 ? '1 gol de penal' : info.penalGol>1 ? info.penalGol + ' goles de penal' : null
    const descriptionPkMissed = info.penalErrado === 1 ? '1 penal errado' : info.penalErrado>1 ? info.penalErrado + ' penales errados' : null
    const descriptionSaves = info.atajadas >= 5 ? info.atajadas + '  atajadas' : null
    const descriptionOwnGoal = info.golEnContra === 1 ? '1 Gol en contra' : info.golEnContra>1 ? info.golEnContra + ' goles en contra' : null
    const descriptionPassLeader = info.liderPases ? 'Lider de pases' : null
    const descriptionPass100 = info.pases >= 100 ? 'más de 100 pases' : null
    const descriptionMoM = info.figura ? 'figura del partido' : null
    const descriptionCleansheet = info.vallaInvicta ?  'Valla invicta ' + descriptionHomeAway + ' (' + info.pos + ')'  : null
    const descriptionGoals = info.goles === 1 ? '1 Gol '+ descriptionHomeAway + ' (' + info.pos + ')' : info.goles>1 ? info.goles + ' goles'+ descriptionHomeAway + ' (' + info.pos + ')' : null
    const descriptionGoalsPost85 = info.golesPost85 === 1 ? '1 Gol post 85min' : info.golesPost85>1 ? info.golesPost85 + ' goles post 85min' : null
    const descriptionGoalsPost85Change = info.golesPost85CambiaResultado === 1 ? '1 Gol cambia resultado' : info.golesPost85CambiaResultado>1 ? info.golesPost85CambiaResultado + ' goles cambia resultado' : null
    const descriptionGoalsOutsideBox = info.golesFueraArea === 1 ? '1 Gol fuera del area' : info.golesFueraArea>1 ? info.golesFueraArea + ' goles fuera del area' : null
    const descriptionAssist = info.asistencias === 1 ? '1 asistencia '+ descriptionHomeAway + ' (' + info.pos + ')' : info.asistencias>1 ? info.asistencias + ' asistencias'+ descriptionHomeAway + ' (' + info.pos + ')' : null
    const descriptionAssistPost85 = info.assistPost85 === 1 ? '1 asistencia post 85min' : info.assistPost85>1 ? info.assistPost85 + ' asistencias post 85min' : null

    const descriptionArray = [
        descriptionPlayed,descriptionYellow,
        descriptionRed, descriptionConceded,
        descriptionPkSaved, descriptionPkScored,
        descriptionPkMissed,descriptionSaves,
        descriptionOwnGoal,descriptionPassLeader,
        descriptionPass100,descriptionMoM,
        descriptionCleansheet,descriptionGoals,
        descriptionGoalsPost85,descriptionGoalsPost85Change,
        descriptionGoalsOutsideBox,descriptionAssist,
        descriptionAssistPost85
    ]

    return descriptionArray.filter(Boolean).join(" / ");
}

export function FP_CalculateAllPoints (data={}){

    let playerFP
    let FPFinal

    if(data.playerPosition==='Equipo'){
        playerFP={
            FPJugado: 0,
            FPResultado: FP_resultado({home:data.home, goals:data.matchResult}),
            FPTarjetas: 0,
            FPPases: 0,
            FPGoles: 0,
            FPAsistencias: 0,
            FPArquero: 0,
            FPPenales: 0,
            FPInvicta: 0,
            FPFigura: 0
        }

        let description
        if(data.matchResult.home === data.matchResult.away){
            description = data.home? 'Empate de local' : 'Empate de visitante'
        } 
        if(data.matchResult.home > data.matchResult.away){
            const dif = data.matchResult.home - data.matchResult.away
            description = data.home ? `Victoria de local por ${dif} ${dif >1 ? 'goles' : 'gol'}` : `Derrota de visitante por ${dif} ${dif >1 ? 'goles' : 'gol'}`
        } 
        if(data.matchResult.home < data.matchResult.away){
            const dif = data.matchResult.away - data.matchResult.home
            description = data.home ? `Derrota de local por ${dif} ${dif >1 ? 'goles' : 'gol'}` : `Victoria de visitante por ${dif} ${dif >1 ? 'goles' : 'gol'}`
        } 

        FPFinal = {
            fantapuntos : playerFP.FPResultado,
            FPDescripcion : description
        }


    }else{
        playerFP = {
            FPJugado : FP_jugado(data.minutosJugadosFantaya),
            FPResultado : 0,
            FPTarjetas : FP_tarjetas({yellow:data.amarillas,red:data.rojas}),
            FPPases : FP_pases({leader:data.liderPases,amount:data.pases}),
            FPGoles : FP_goles({pos:data.playerPosition, home: data.home, goals:data.goles, min85:data.golesPost85, min85change:data.golesPost85CambiaResultado, outsideBox:data.golesFueraArea, ownGoal:data.golEnContra}),
            FPAsistencias : FP_asistencia({pos:data.playerPosition, home: data.home, assis:data.asistencias, min85:data.assistPost85}),
            FPArquero : FP_arquero({saves:data.atajadas, goals:data.golesRecibidos}),
            FPPenales : FP_penales({missed:data.penalErrado,scored:data.penalGol,saved:data.penalAtajado}),
            FPInvicta : FP_invicta({player:{home:data.home, pos:data.playerPosition},invicta:data.vallaInvicta}),
            FPFigura : FP_figura(data.figura)
          }
          
        FPFinal = {
            fantapuntos : playerFP.FPJugado + playerFP.FPResultado + playerFP.FPTarjetas + playerFP.FPGoles + playerFP.FPAsistencias + playerFP.FPPases + playerFP.FPArquero + playerFP.FPPenales + playerFP.FPInvicta + playerFP.FPFigura,
            FPDescripcion : FP_descripcion({...data, home:data.home, pos:data.playerPosition})
        }
    }


      return [playerFP,FPFinal]




}


export function modifyPlayersForCards (team){

    const matchPlayerData = [team]
    
    let filteredData = matchPlayerData.map(team => team.cardpoint)
    
    const lineupOrder = ['Titular','Suplente','Equipo', 'No Convocado'];
    const positionOrder = ['Equipo', 'Arq', 'Def', 'Med', 'Del'];

    let sortedData = filteredData.map(team =>{   
        return (
            team.sort( (a, b) =>
                positionOrder.indexOf(a.player.position) - positionOrder.indexOf(b.player.position)
            )
        )
    })
    
    sortedData = sortedData.map(team =>{   
        return (
            team.sort( (a, b) =>
                lineupOrder.indexOf(a.lineup) - lineupOrder.indexOf(b.lineup)
            )
        )
    })

    return sortedData

}

export function cards_subLogic (teamPlayers=[]){

    let score = 0
    let team = []
    
    let grouping ={
        startXI : {
            played: teamPlayers.filter(player => player.lineup==='Titular' && (player.details && player.details.fpDescripcion !== 'No Jugó') && (player.details && player.details.fpDescripcion !== 'No Fue Convocado') && (player.details && player.details.fpDescripcion !== 'Partido sin calcular') ),
            notPlayed: teamPlayers.filter(player => player.lineup==='Titular' && ( (player.details && player.details.fpDescripcion === 'No Jugó') || (player.details && player.details.fpDescripcion === 'No Fue Convocado')) ),
            yetToPlay: teamPlayers.filter(player => player.lineup==='Titular' && (!player.details || player.details.fpDescripcion==='Partido sin calcular') )
        },
        subs : {
            played: teamPlayers.filter(player => player.lineup==='Suplente' && ( (player.details && player.details.fpDescripcion !== 'No Jugó') && (player.details && player.details.fpDescripcion !== 'No Fue Convocado') && (player.details && player.details.fpDescripcion !== 'Partido sin calcular') ) ),
            notPlayed: teamPlayers.filter(player => player.lineup==='Suplente' && ( (player.details && player.details.fpDescripcion === 'No Jugó') || (player.details && player.details.fpDescripcion === 'No Fue Convocado') ) ),
            yetToPlay: teamPlayers.filter(player => player.lineup==='Suplente' && (!player.details || player.details.fpDescripcion==='Partido sin calcular') )
         }
    }

    teamPlayers.forEach( (player,idx) => {
   
        if(!player.details){
            player.details = {
                fpDescripcion: 'Partido sin calcular',
                fantapuntos:0
            }
        }


        let fp = 0
        if(player.lineup !== 'No Convocado'){
            const position = player.player.position

            if(player.lineup==='Titular'){
                const isYetToPlay = grouping.startXI.yetToPlay.filter(item => item.idPlayer === player.idPlayer).length > 0
                const hasPlayed = grouping.startXI.notPlayed.filter(item => item.idPlayer === player.idPlayer).length === 0

                if(isYetToPlay){
                    // Elegido Titular pero todavia el partido no se jugó
                    player.totalFantapoints = ''
                    fp = 0
                    
                }else if(hasPlayed){
                    // Elegido Titular y jugó en su partido
                    
                    player.totalFantapoints = Number(player.details.fantapuntos)
                    fp = Number(player.details.fantapuntos)
                }else{
                    // Elegido Titular y no jugó en su partido
                    const hasSubPlayed = grouping.subs.played.filter(item => item.player.position === position).length > 0
                    const isSubYetToPlay = grouping.subs.yetToPlay.filter(item => item.player.position === position).length>0 
                    const otherXIYetToPlay = grouping.startXI.yetToPlay.filter(item => item.player.position === position).length>0 
                    const existSubInPos = (hasSubPlayed===false && isSubYetToPlay===false) ? false : true
                    
                    
                    if(otherXIYetToPlay){
                        // si hay otro titular disponible sin jugar todavia, se deja en fp=0 y totalFantapoints=''
                        player.totalFantapoints = ''
                        fp = 0
                    }else if(!existSubInPos){
                        // si no hay suplente disponible, debe restar 4(arq) o 3(no arq)
                        player.totalFantapoints = position ==='Arq' ? -4 : -3
                        fp = position ==='Arq' ? -4 : -3
                        
                    }else if(isSubYetToPlay){
                        // si hay suplente disponible, y suplente disp isYetToPlay o jugó se deja en fp=0 y totalFantapoints= ''
                        player.totalFantapoints = ''
                        fp = 0
                        
                        const toDelete = grouping.subs.yetToPlay.find(item => item.player.position === position)
                        grouping.subs.yetToPlay = grouping.subs.yetToPlay.filter(p => p.idPlayer !== toDelete.idPlayer)
                        
                        
                    }else if(hasSubPlayed){
                        // si hay suplente disponible, y suplente disp isYetToPlay o jugó se deja en fp=0 y totalFantapoints= ''
                        player.totalFantapoints = ''
                        fp = 0
                        
                        const toDelete = grouping.subs.played.find(item => item.player.position === position)
                        grouping.subs.played = grouping.subs.played.filter(p => p.idPlayer !== toDelete.idPlayer)

                    }else if(!hasSubPlayed){
                        
                        // si suplente disponible no jugó debe restar 4(arq) o 3(no arq)
                        player.totalFantapoints = position ==='Arq' ? -4 : -3
                        fp = position ==='Arq' ? -4 : -3

                        
                    }
                }
                
            }else if(player.lineup==='Suplente'){
                // Elegido Suplente
                const isYetToPlay = grouping.subs.yetToPlay.filter(item => item.idPlayer === player.idPlayer).length > 0
                const hasPlayed = grouping.subs.notPlayed.filter(item => item.idPlayer === player.idPlayer).length === 0
                

                const hasAllStartPlayed = grouping.startXI.notPlayed.filter(item => item.player.position === position).length === 0
                if(hasAllStartPlayed){
                    // si en la misma posicion no hay titulares sin jugar, no se cuenta (fp=0 totalfantapoints='')
                    player.totalFantapoints = ''
                    fp = 0
                }else{
                    // si en la misma posicion hay al menos 1 titular que no jugó, se cuenta (fp=totalfantapoints) 
                    // y se saca del listado de suplentes
                    player.totalFantapoints = hasPlayed ? Number(player.details.fantapuntos) : isYetToPlay ? '' : 0
                    fp = hasPlayed ? Number(player.details.fantapuntos) : 0
                }
            }else if(player.lineup === 'Equipo'){
                const teamYetToPlay = teamPlayers.filter(player => player.lineup==='Equipo' && (!player.details || player.details.fpDescripcion==='Partido sin calcular')).length > 0
                player.totalFantapoints = teamYetToPlay ? '' : Number(player.details.fantapuntos)
                fp = teamYetToPlay ? 0 : Number(player.details.fantapuntos)
            }
        }
        
        score = score + fp
        team.push(player)
    })




    return {score:score, team:team}
}

export function cards_captainLogic (homeCaptain,awayCaptain){
    
    if(!homeCaptain && !awayCaptain){
        return [0,0]
    }
    if(homeCaptain && !awayCaptain){        
        return [2,0]
    }
    if(!homeCaptain && awayCaptain){
        return [0,2]
    }

    const homeCaptain_notYet = (homeCaptain.details && homeCaptain.details.fpDescripcion === 'Partido sin calcular')
    const awayCaptain_notYet = (awayCaptain.details && awayCaptain.details.fpDescripcion === 'Partido sin calcular')
    if(homeCaptain_notYet || awayCaptain_notYet){
        return [0,0]
    }
    

    const homeCaptain_notPlayed = (homeCaptain.details && homeCaptain.details.fpDescripcion === 'No Jugó') || (homeCaptain.details && homeCaptain.details.fpDescripcion === 'No Fue Convocado')
    const awayCaptain_notPlayed = (awayCaptain.details && awayCaptain.details.fpDescripcion === 'No Jugó') || (awayCaptain.details && awayCaptain.details.fpDescripcion === 'No Fue Convocado')
    if((awayCaptain_notPlayed && !homeCaptain_notPlayed) || homeCaptain.details.fantapuntos > awayCaptain.details.fantapuntos){

        homeCaptain.captainPoints = 2;
        homeCaptain.totalFantapoints = homeCaptain.totalFantapoints + 2
        return [2,0]
    }
    
    if((homeCaptain_notPlayed && !awayCaptain_notPlayed) || awayCaptain.details.fantapuntos > homeCaptain.details.fantapuntos){

        awayCaptain.captainPoints = 2;
        awayCaptain.totalFantapoints = awayCaptain.totalFantapoints + 2
        return [0,2]
    }

        return [0,0]

}

export function cards_captainLogic_multiple (captains,homeCaptain,awayCaptain){
    captains.forEach(captain => {
        if(!captain.details){
            captain.details = {
                fpDescripcion: 'Partido sin calcular',
                fantapuntos:0
            }
        }
    })

    

    const notYet = captains.filter(captain => captain.details.fpDescripcion === 'Partido sin calcular')
    if(notYet.length){
        return [0,0]
    }


    const maxCapPoints = captains.reduce((acc,c)=> (Number(c.details.fantapuntos)||0) >= acc?Number(c.details.fantapuntos):acc,0)
    

    if( homeCaptain.details.fantapuntos >= maxCapPoints){
        
        homeCaptain.captainPoints = 2;
        homeCaptain.totalFantapoints = homeCaptain.totalFantapoints + 2
        return [2,0]
    }
    
    if(awayCaptain && awayCaptain.details.fantapuntos >= maxCapPoints){

        awayCaptain.captainPoints = 2;
        awayCaptain.totalFantapoints = awayCaptain.totalFantapoints + 2
        return [0,2]
    }

        return [0,0]

}

export function cards_ddLogic (player,isAway){
    
    if(!player){
        return 0
    } 

    let additional = 0
    if(player.defensorDesignado && player.details.vallaInvicta){
        const additionalDef = player.player.position === 'Def' ? 2 : 0
        
        additional = additionalDef

        player.totalFantapoints = player.totalFantapoints + additional
        player.ddPoints = additional
        
    }
    return additional > 0 ? additional : 0

}

export function cards_logic(teamA,teamB,from='intial', moreCaptains=false){

        let homeDD_points = 0
        let awayDD_points = 0
        let homeCaptain_points = 0
        let awayCaptain_points = 0

        
        if(from==='initial'){
            //// SUPLENTES ////   
            let { score: homeScore, team: homeTeam } = cards_subLogic(teamA)
            let { score: awayScore, team: awayTeam } = cards_subLogic(teamB)

            //// DD ////
            const homeDD = homeTeam.find(p => p.defensorDesignado)
            const awayDD = awayTeam.find(p => p.defensorDesignado)
    
            homeDD_points = cards_ddLogic(homeDD,false)
            awayDD_points = cards_ddLogic(awayDD,true)

            //// C ////
            const homeCaptain = homeTeam.find(p => p.captain)
            const awayCaptain = awayTeam.find(p => p.captain)
            let captainPoints

            if(!moreCaptains){
                captainPoints = cards_captainLogic(homeCaptain,awayCaptain)
            }else{
                
                captainPoints = cards_captainLogic_multiple(moreCaptains,homeCaptain,awayCaptain)
            }
            homeCaptain_points = captainPoints[0] 
            awayCaptain_points = captainPoints[1]


            const updatedStats = {
                fantaHome: homeTeam,
                fantaAway: awayTeam,
                maxPlayers:Math.max(homeTeam.filter(i=>i.lineup !=='No Convocado').length, awayTeam.filter(i=>i.lineup !=='No Convocado').length)
            }
            
            homeScore = homeScore + homeDD_points + homeCaptain_points
            awayScore = awayScore + awayDD_points + awayCaptain_points
    
            return [updatedStats, {home:homeScore,away:awayScore}]
            
        }else if(from==='userCDD'){

            
            const updatedStats = {
                fantaHome: teamA,
                fantaAway: teamB,
                maxPlayers:Math.max(teamA.filter(i=>i.lineup !=='No Convocado').length, teamB.filter(i=>i.lineup !=='No Convocado').length)
            }
            
            const homeScore = teamA.reduce((acc,p) => (Number(p.totalFantapoints)||0) + acc,0 )
            const awayScore = teamB.reduce((acc,p) => (Number(p.totalFantapoints)||0) + acc,0 )
            
            return [updatedStats, {home:homeScore,away:awayScore}]
            
        }

        



}