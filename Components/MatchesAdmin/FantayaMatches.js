import React, { useState, useEffect } from 'react';
import { getCardsByFixture, getFixture, getSeasonsWithDetails, getTeams } from '../../callDB.js';
import { modifyPlayersForCards } from '../../dataManipulation.js';
import SeasonFixtureFilters from '../SeasonFixtureFilters.js';
import Card from '../Cards/Card.js';
import { groupByProperty } from '../../helper.js';
import CardMultiple from '../Cards/CardMultiple.js';






const FantayaMatches = () => {
    const [selections, setSelections] = useState({
        fixture: '',
        season:''
    });

    const [allSeasons, setAllSeasons] = useState([])

    
    const [allCards, setAllCards] = useState([]);

    const [fixtures, setFixtures] = useState([]);
    const [teams, setTeams] = useState([]);

    


    useEffect(()=>{
        const fetchData = async () => {
            try {

                // modificar para cambiar el fixture dependiendo season que quiera el usuario
                const seasonsData = await getSeasonsWithDetails()
                const teamsData = await getTeams()

                setAllSeasons(seasonsData)
                setTeams(teamsData)                
                                

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        
        fetchData();



    },[])

    useEffect(()=>{
        const fetchData = async () => {
            try {

                const fixturesData = await getFixture(selections.season)
                
                
                setFixtures(fixturesData)
                                

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        if(selections.season){

            fetchData();
        }

    },[selections.season])

    useEffect(()=>{
        const fetchData = async () => {
            try {

                const cards = await getCardsByFixture(selections.fixture)
                let cardsData = []
                let finalOrder = []

                if(cards.single){
                    finalOrder = cards.single.map( c => [...modifyPlayersForCards(c.teamHome),...modifyPlayersForCards(c.teamAway)])
                    
                    cardsData.push(...finalOrder)
                }

                if(cards.multiple){

                    const groupedCards = groupByProperty(cards.multiple,'match')
                    
                    finalOrder = Object.keys(groupedCards).map( key => {
                        let finalCard = []
                        groupedCards[key].forEach( team => finalCard.push(...modifyPlayersForCards(team.team)) )

                        return finalCard
                    })

                    cardsData.push(...finalOrder)
                    
                    
                }
                // const cardsData = cards.map(c => modifyPlayersForCards({home:c.teamHome, away:c.teamAway}) )

                setAllCards(cardsData)

                                

            } catch (error) {
                console.error("Error fetching fixtures:", error);
            }
        };
        
        if(selections.fixture){

            fetchData();
        }



    },[selections.fixture])

    
    return (
        <div className="main-component">
            {fixtures && 
                <SeasonFixtureFilters 
                    fixtures={fixtures}
                    seasons={allSeasons}
                    selections={selections}
                    setSelections={setSelections}
                />
            }
            
            
            { allCards &&
                    allCards.map (c =>{                        
                        
                        const isMultiple = c.length>2

                        const cardsInPair = Array.from({ length: Math.ceil(c.length / 2) }, (_, i) => c.slice(i * 2, i * 2 + 2));

                        
                        if(isMultiple){

                        return cardsInPair.map(pair =>{
                            return (
                                
                                <Card
                                    allCaptains={c.map(t=>t.find(player=> player.captain)).flat()}
                                    players={pair}
                                    teams={ {home: teams.find(t=> t.id==pair[0][0].idTeam), away: pair.length>1 ? teams.find(t=> t.id==pair[1][1].idTeam) : ''} }
                                    fixture={selections.fixture}
                                />     
                            )

                        })

                            

                        }else{
                            return (
                                
                                <Card 
                                    allCaptains={false}
                                    players={c}
                                    teams={ {home: teams.find(t=> t.id==c[0][0].idTeam), away:teams.find(t=> t.id==c[1][1].idTeam)}}
                                    fixture={selections.fixture}
                                />     
                            )
                        }
                    }
                        
                    ) 
            }

        </div>
    );
};

export default FantayaMatches;
