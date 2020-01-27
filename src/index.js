import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import adapter from './adapter'
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const playButton = document.getElementById("play-button");
const shotButton = document.getElementById("shot-button");
const passButton = document.getElementById("pass-button");


const addPlayer = document.getElementById("add-player-field");
const addPlayerForm = document.getElementById("add-player-form")
const playerNameField = document.getElementById("add-player-field")

//change to implient timer and coin flip
const leftMenu = document.getElementById("left-menu")
const showDare = document.getElementById("dares");

const playerDareButton = document.getElementById("player-dares");
const allDaresButton = document.getElementById("game-dares");
const scoreboard = document.getElementById("scoreboard")
const homeButton = document.getElementById("home");
const ruleButton = document.getElementById("rules");

const turnPlayer = document.getElementById("turn-player");
const playerScore = document.getElementById("game-score");
const playerShots = document.getElementById("shots-count");


const disclaimer ="KNOW YOUR LIMIT: Double Dog Dare is designed as an adult “drinking game” but may be played without consumption of alcohol. We do not recommend misuse of alcohol including excessive consumption, binge-drinking, drinking and driving/boating, and/or underage drinking. It is the players’ responsibility to monitor and moderate their alcohol consumption. We recommend that all players make adequate arrangements for their personal safety and transportation BEFORE playing."

var winScore;
var eventSpace;

var listOfDares = [];
var listOfGames = [];
var previousDares = [];
var recentDares = [];
var gameId =0;

var currentDare = {};
var currentId = -1;

var currentPlayers = {};
var listOfPlayerTurns = {};
var listOfPlayersTurns = {};
var listOfGameTurns = {};
var randomPlayer = {};
var selectedPlayer = {};


var currentPlayer = currentPlayers[currentId];

addPlayer.focus()


//class construstion
class Player{
	constructor(id, name, score, shots){
		this.id = id;
        this.name = name;
        this.score = score;
        this.shots = shots;
	}

	//additional class methods
	addScore() {
		this.score += currentDare.points
	}
	subtractScore(){
		this.score -= currentDare.points
	}
	addShot(){
		this.shots += currentDare.shots
	}
}
//to be called on load
document.addEventListener('DOMContentLoaded', function(){
 	fetchDares();
 	startGame();
 	alert(disclaimer)

 })

//click event(s) for play button
gameTurns(playButton,doneDare);


//funcion to see if game is finished
function gameWon(){
	
	if (currentPlayer.score >= winScore){
		alert("Game OVER\n" + currentPlayer.name +" has won the game!!\n refresh the page to start a new game")
		playButton.disabled = true
		shotButton.disabled = true
		passButton.disabled = true
	}
}

//click event(s) for shot button
gameTurns(shotButton,shotDare);


//click event(s) for pass button
	passButton.addEventListener("click", passDare,false);
	passButton.addEventListener("click", getScoreboard,false);
//click event for add player button 
addPlayerForm.addEventListener('submit', e=> {
	e.preventDefault()

	let player = playerNameField.value
	player = capitalizeWord(player)

	let newPlayer = {name: player}

	if(player){
		adapter.createPlayer(newPlayer,gameId).then(res=> {
			//enable elements
		fetchPlayers();
		playerNameField.value = ""
		playerNameField.placeholder="Add a Player"
		alert(player +" was added")

		
		})
		playButton.disabled=false
		
	}
	else {
		alert("Please ener a name")
	}
});

//creates a game, triggered on page load
function startGame(){	
	adapter.createGame().then(res=> {
		fetchGame();
	})	
 }


//capitalize first letter in player names
function capitalizeWord(string){
	const s = string.toLowerCase()
	return s.charAt(0).toUpperCase() + s.slice(1)
}


//fuctions to create and retrieve turns
function gameTurns(button,buttonFunction){
	button.addEventListener("click", buttonFunction,false);
	button.addEventListener("click", getScoreboard,false);
	button.addEventListener("click", function(){generateDare(listOfDares)},false);
	button.addEventListener("click", function(){createTurn()},false);
}

//reveal past dares in info space
function showGameDares(){	
	var pastDares = [];
	let currentName = ""
	let currentText = ""
	for(let i = 0; i < listOfGameTurns.length; i++)
	{	

		currentName = Object.values(currentPlayers).find(x => x.id == listOfPlayerTurns[listOfGameTurns[i].player_turn_id-1].player_id).name
		currentText = listOfDares.find(x => x.id == listOfPlayerTurns.find(t => t.id ==[listOfGameTurns[i].player_turn_id]).dare_id).text

		 pastDares += `
 		<span> 
 			turn: ${(i+1)}<br>
 			player: ${currentName}<br>
				
 			dare: ${currentText}<br>
			<br>
 		</span>
 	`
	}
	showDare.innerHTML= `<div id ="info"> <h1>All Past Dares</h1><br>`+pastDares +`</div>`;
}

function showPlayersDares(){
	var playerDares = [];
	for(let i = 0; i < listOfPlayersTurns.length; i++)
	{	
		 playerDares += `
 		<span> 
 			turn: ${(i+1)}<br><br>
 			dare: ${listOfDares[(listOfPlayersTurns[i].dare_id-1)].text}<br>
			<br>
 		</span>
 	`
	}
 	showDare.innerHTML= `<div id ="info"> <h1>Your Past Dares</h1><br>`+playerDares +`</div>`;
}

function showRules(){

	showDare.innerHTML= `<div id ="info"> <h1>Rules</h1>
 		Welcome to Double Dog Dare <br><br> The rules are simple first one to 10 points wins! The turns go in order from the first person added to the last. 
 		When it is your turn you have the choice of: <br><br>  1.(PLAY) Doing the dare and gaining the points (if your dare involves another person that does not consent see note). <br><br> 2.(SHOT) Taking the penalty shot(s)
 		allowing you to pass the dare without losing any points. <br><br> 3.(PASS) Passing the dare avoiding the penalty shot(s) but also losing the losing the 
 		same amount of points you would have gained(only if you have enough points to do so).  <br><br> **note** If you choose to not participate in any dare that is not your own you must take a shot and the the turn player may gain the points <br>
 		</div>`;
}

function createTurn(){
	adapter.createPlayerTurn(currentPlayer.id, currentDare.id).then(res => {
		fetchPlayerTurns();
		fetchPlayersTurns();
	})
}

function createGameTurn(){
	adapter.createGameTurn(gameId,listOfPlayerTurns[listOfPlayerTurns.length-1].id).then (res => {
	fetchGameTurns();
	})
}



function getScoreboard(){	
	var theScore = [];
	for(let i = 0; i < Object.keys(currentPlayers).length; i++)
	{	
		 theScore += `
 		<span> 
 			${currentPlayers[i].name}<br>
 			score: ${currentPlayers[i].score}<br>
			shots: ${currentPlayers[i].shots}<br>
			<br>
 		</span>
 	`
	}
	showDare.innerHTML= `<div id ="info"> <h1>Scoreboard</h1>`+theScore +`</div>`

}

function getHome(){
	showDare.innerHTML = currentDare.text +
		`<br><br><span>points: </span>`+ currentDare.points + `<br> <span>penalty shot(s): </span>`+ currentDare.shots;
}


function doneDare(){
	 if (previousDares.length >= 1){
		if ((currentPlayer.score + currentDare.points)<0) {
			alert("you dont have enough points!\n You will be given a new dare!!")
		}
		else if (currentPlayer.score + currentDare.points >= winScore) {
			currentPlayer.addScore();
		 	gameWon()	
		}
		else {
			currentPlayer.addScore();
			TurnPlayer();
		}
		playerScore.innerHTML = currentPlayer.score	
	}
	else{
		shotButton.disabled=false
		passButton.disabled=false
		// buttons for scoreboard, rules, player dares, and game dares
	
		playerDareButton.addEventListener("click", showPlayersDares,false);
		allDaresButton.addEventListener("click", showGameDares,false);
		ruleButton.addEventListener("click", showRules,false);
		scoreboard.addEventListener("click", getScoreboard,false);
		homeButton.addEventListener("click", getHome,false)
		TurnPlayer();
	}
		
}

function shotDare(){
	if(leftMenu.childNodes.length>13){
		 removeEvent()
		 playButton.disabled = false
	}
	else{
		currentPlayer.addShot()
		getScoreboard()
		TurnPlayer();
	}
}

function passDare(){
	if (currentPlayer.score <=0) {
		alert("you dont have any points! \nYou will have to do the dare or take the penalty shot(s).")
	}
	else if ((currentPlayer.score - currentDare.points)<0) {
		alert("you dont have enough points to pass this dare! \nYou will have to do the dare or take the penalty shot(s).")
	}
	else if (currentDare.points < 0) {
		currentPlayer.addScore();
		playerScore.innerHTML = currentPlayer.score;
	 
	 	getScoreboard();
	 	TurnPlayer();
	 	generateDare(listOfDares)
		createTurn()
	}
	else if (leftMenu.childNodes.length>13){
		 removeEvent()
		 playButton.disabled = false
	}
	else{
	 	currentPlayer.subtractScore()
	 	playerScore.innerHTML = currentPlayer.score;
	 	
	 	getScoreboard();
	 	TurnPlayer();
	 	generateDare(listOfDares)
		createTurn()
	}
}

//cycles through the list of players
function TurnPlayer(){
	if (currentId >= Object.keys(currentPlayers).length-1) {
		currentId = -1;

	}
	currentId ++
	currentPlayer = currentPlayers[currentId];

	turnPlayer.innerHTML = "Turn Player: "+ currentPlayer.name;
	playerScore.innerHTML = currentPlayer.score;
	playerShots.innerHTML = currentPlayer.shots;
}


//retieves game id
function fetchGame(){
	adapter.getGame()
	.then(games => retrieveGame(games))
}

//collects dares from backend.
function fetchDares() {
	adapter.getDares()
	.then(dares => retrieveDares(dares))	
}

//collects players from backend.
function fetchPlayers() {
	adapter.getPlayers(gameId)
	.then(players => retrievePlayers(players))	
}


//collects player turns from backend.
function fetchPlayerTurns(){
	adapter.getPlayerTurns()
		.then(playerTurns => retrievePlayerTurns(playerTurns))
}

//collects certain player turns
function fetchPlayersTurns(){
	adapter.getPlayerTurns()
		.then(playerTurns => retrievePlayersTurns(playerTurns))
}

//collects game turns from backend.
function fetchGameTurns(){
	adapter.getGameTurns(gameId)
		.then(gameTurns => retrieveGameTurns(gameTurns))
}

function  retrieveGame(games){
	listOfGames = [];
	games.forEach(game=> {		
		listOfGames.push(game);	
	});


	gameId = listOfGames[(listOfGames.length-1)].id;
	winScore = listOfGames[(listOfGames.length-1)].winScore;
	


}

//all loaded Dares
function  retrieveDares(dares){
	let dareList = [];
	dares.forEach(dare=> {		
		dareList.push(dare);	
	});
	listOfDares = dareList;
}


//all loaded players
function  retrievePlayers(players){
	let i = 0
	players.forEach(player=> {		
		currentPlayers[i] = new Player(player.id, player.name, player.score, player.shots)
		i++	
	});
}

//load player turns
function retrievePlayerTurns(playerTurns){
	let playerTurnList = [];
	playerTurns.forEach(turn=>{
		playerTurnList.push(turn)
	});
	listOfPlayerTurns = playerTurnList;
	createGameTurn();
}

//load game turns 
function retrieveGameTurns(gameTurns){
	let gameTurnsList = [];
	gameTurns.forEach(gameTurn=>{
		gameTurnsList.push(gameTurn)
	});
	listOfGameTurns = gameTurnsList;
}

//load current players turns
function retrievePlayersTurns(playerTurns){
	let playersTurnList = [];
	playerTurns.forEach(turn=>{
		if (turn.player_id == currentPlayer.id)
		{
			playersTurnList.push(turn)
		}
		
	});
	listOfPlayersTurns = playersTurnList;
	}

//randomly selects a Player.
function generatePlayer(){
	return Math.floor(Math.random() * (Object.keys(currentPlayers).length));
}

function generateEvent(){
	var node = document.createElement("A");
	node.setAttribute("id", "event");
	node.setAttribute("class", "item");
	var textnode = document.createTextNode("");
	node.appendChild(textnode);
	leftMenu.appendChild(node)

	eventSpace = document.getElementById("event");
}

function removeEvent(){
	leftMenu.removeChild(leftMenu.childNodes[13]); 
}

function removelistener(){
	eventSpace.removeEventListener("click", function(){startTimer(15, eventSpace)},false);
}

//randomly selects a dare.
function generateDare()   
 {		 
 	let ranDare = Math.floor(Math.random() * (listOfDares.length));
 	currentDare = listOfDares[ranDare];	
 	let dareText = currentDare.text

	//checks to see if a random player needs to be inserted
	if(recentDares.includes(currentDare.id)){
		console.log(currentDare.text);
		console.log("dare recently occured, generating new one");
		generateDare();
	}
	else{
		if (currentDare.text.includes("15 seconds")){
			playButton.disabled = true;
    		generateEvent();
    		eventSpace.textContent = "Start Timer";
    		eventSpace.addEventListener("click", function(){startTimer(15, eventSpace)},false);
    		removelistener();
		}
		else if (currentDare.text.includes("a minute")){
			playButton.disabled = true;
    		generateEvent();
    		eventSpace.textContent = "Start Timer";
    		eventSpace.addEventListener("click", function(){startTimer(60, eventSpace)},false);
    		removelistener();
		}
		else if (currentDare.text.includes("Flip a coin")) {
			playButton.disabled = true;
			generateEvent();
    		eventSpace.textContent = "Flip A Coin";
    		eventSpace.addEventListener("click", function(){coinFlip(4, eventSpace)},false);
    		removelistener();

		}	
		else if (currentDare.text.includes("x is the") && currentPlayer.shots < 3){
	
				console.log("new dare was chosen")
				generateDare();	
		}
		if (dareText.includes("[RandomPlayer]")){
			randomPlayer=  generatePlayer();
			selectedPlayer = currentPlayers[randomPlayer];
			//stops current player from being the random player
			if (selectedPlayer.id == currentPlayer.id){
				while (selectedPlayer.id == currentPlayer.id){
					randomPlayer=  generatePlayer();
					selectedPlayer = currentPlayers[randomPlayer];
				}
			}
			dareText = dareText.replace("[RandomPlayer]", selectedPlayer.name);
		}
		
	 	
		showDare.innerHTML = dareText +
		`<br><br><span>points: </span>`+ currentDare.points + `<br> <span>penalty shot(s): </span>`+ currentDare.shots;
		dareArchive(currentDare);
	
		if (listOfGameTurns.length >= 10){
		recentDares.shift();
		recentDares.push(currentDare.id);
		}
		else{
			recentDares.push(currentDare.id);
		}
	}	
 }

	 function startTimer(duration, display) {
	    let timer = duration, minutes, seconds;
	    setInterval(function () {
	        minutes = parseInt(timer / 60, 10);
	        seconds = parseInt(timer % 60, 10);

	        minutes = minutes < 10 ? "0" + minutes : minutes;
	        seconds = seconds < 10 ? "0" + seconds : seconds;

	        display.textContent = minutes + ":" + seconds;

	        if (--timer == -1) {
	            removeEvent()
	            playButton.disabled = false
	        }
		}, 1000);
	}

	 function coinFlip(duration, display) {
	    let timer = duration, minutes, seconds;
	    setInterval(function () {
	        minutes = parseInt(timer / 60, 10);
	        seconds = parseInt(timer % 60, 10);

	        minutes = minutes < 10 ? "0" + minutes : minutes;
	        seconds = seconds < 10 ? "0" + seconds : seconds;

	        

	        if (--timer == -1) {
	            removeEvent()
	            playButton.disabled = false
	        }
	        else if (timer == 3){
	        	display.textContent = display = (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
	        }
		}, 1000);
	}
//        if (timer == 3)
//	        	display = (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
//	     	else if (--timer == 0) {
//    			removeEvent()
//    		}
//creates archive for all players of current game
	function dareArchive(currentDare) {
		previousDares.push(currentDare);
	}
