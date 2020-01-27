const PROXY = "https://cors-anywhere-dd.herokuapp.com/";
const OURL = "https://double-dog-backend.herokuapp.com/"
//const URL = "http://localhost:3000/"
const URL = PROXY + OURL

const adapter = {
//game
createGame: () => {
  return fetch(`${URL}/games`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.json()) 
  },

  getGame: () => {
    return fetch(`${URL}/games`)
    .then(resp => resp.json())
  },

//players
  getPlayers: (game_id) => {
    return fetch(`${URL}/games/${game_id}/players`,{
      headers: { "Content-Type": "application/json" },
    })
    .then(resp => resp.json())
  },

  createPlayer: (name, game_id) => {
    return fetch(`${URL}/games/${game_id}/players`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(name, game_id)
    })
    .then(resp => resp.json()) 
  },


//player turns
  getPlayerTurns: () => {
    return fetch(`${URL}/player_turns`)
    .then(res=>res.json())
  },

  createPlayerTurn: (player_id, dare_id) => {
    return fetch(`${URL}/player_turns`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({player_id, dare_id})
    })
    .then(resp => resp.json()) 
  },

  //game turns
    getGameTurns: (game_id) => {
    return fetch(`${URL}/games/${game_id}/game_turns`)
    .then(res=>res.json())
  },

    createGameTurn: (game_id, player_turn_id) => {
    return fetch(`${URL}/games/${game_id}/game_turns`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({game_id, player_turn_id})
    })
    .then(resp => resp.json()) 
  },

//dares
  getDares: () => {
  	return fetch(`${URL}/dares`)
  	.then(resp => resp.json()) 
  }
}
export default adapter;