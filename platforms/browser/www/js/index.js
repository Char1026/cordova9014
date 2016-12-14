"use strict";

if (document.deviceready){
    document.addEventListener('deviceready', onDeviceReady);
} else {
    document.addEventListener('DOMContentLoaded', onDeviceReady);
}

let pages = []; // used to store all our screens/pages
let links = []; // used to store all our navigation links


function onDeviceReady(){
    console.log("Ready");
    
    serverData.getJSON();
    
    pages = document.querySelectorAll('[data-role="page"]');
    links = document.querySelectorAll('[data-role="nav"] a');
//    let re= document.querySelector(".reload");
//    re[0].addEventListener("click", serverData.getJSON);    
//    re[1].addEventListener("click", serverData.getJSON);    
    
    for(let i=0; i<links.length; i++) {
        links[i].addEventListener("click", navigate);
        
        
    }
    document.getElementById("refresh").addEventListener("click", btnRefresh);
    document.getElementById("rrefresh").addEventListener("click", btnRefresh);
//    displayData(data);
//    fakeStandingsData();
}

function btnRefresh(ev){
    ev.preventDefault();
    serverData.getJSON();
}

function navigate(ev) {
    ev.preventDefault(); 

    let link = ev.currentTarget; 
    console.log(link);
    // split a string into an array of substrings using # as the seperator
    let id = link.href.split("#")[1]; // get the href page name
    console.log(id);
    //update what is shown in the location bar
    history.replaceState({}, "", link.href);
    
    for(let i=0; i<pages.length; i++) {
        if(pages[i].id == id){
            pages[i].classList.add("active");
        } else {
            pages[i].classList.remove("active");
        }           
    }
}



let serverData = {
    url: "https://griffis.edumedia.ca/mad9014/sports/hockey.php",
    httpRequest: "GET",
    getJSON: function () {
        
        // Add headers and options objects
        // Create an empty Request Headers instance
        let headers = new Headers();

        // Add a header(s)
        // key value pairs sent to the server

        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");
        
        // simply show them in the console
        console.dir("headers: " + headers.get("Content-Type"));
        console.dir("headers: " + headers.get("Accept"));
        
        // Now the best way to get this data all together is to use an options object:
        
         // Create an options object
        let options = {
            method: serverData.httpRequest,
            mode: "cors",
            headers: headers
        };
        
        // Create an request object so everything we need is in one package
        let request = new Request(serverData.url, options);
        console.log(request);
           
        fetch(request)
            .then(function (response) {

                console.log(response);
                return response.json();
            })
            .then(function (data) {
                console.log(data); 
                // now we have JS data, let's display it

                // Call a function that uses the data we recieved  
                displayData(data);
            })
            .catch(function (err) {
                alert("Error: " + err.message + err.lineNumber);
            });
    }
};

function displayData(data) {
  console.log(data);
  
    localStorage.setItem("scores", JSON.stringify(data));
    
    // get stored data and convert it back to a JS Array
//    var myScoreData = JSON.parse(localStorage.getItem("scores"));
//    console.log("From LS: ");
//    console.log(myScoreData);
    
    console.log(data.teams);
    console.log(data.scores);
    
    let ul = document.querySelector("#results_list");
    ul.innerHTML = "";
    console.log(ul);
    
   
    data.scores.forEach(function (value){
       
        let li = document.createElement("li");
        li.className = "score";
        
        let h3 = document.createElement("h3");
        h3.textContent = value.date;
        
        let homeTeam = null;
        let awayTeam = null;
        
        ul.appendChild(li);
        ul.appendChild(h3);
        
        value.games.forEach(function (item){
            
            homeTeam = getTeamName(data.teams, item.home);
            awayTeam = getTeamName(data.teams, item.away);
            
            let dg = document.createElement("div");
            
            let home = document.createElement("div");
            console.log("This is "+home);
          
            home.className = "hTeam";
            home.innerHTML = homeTeam + " " + "<b>" + item.home_score + "</b>" + "&nbsp" + "<br>";
 
            let away = document.createElement("div");
            away.className = "aTeam";
            away.innerHTML = "<b>" + item.away_score + " " + "</b>" + awayTeam + "&nbsp";

            dg.appendChild(home);
            dg.appendChild(away);
            ul.appendChild(dg);
          
        })
        });
         
        let scores = data.scores;
        let teams = data.teams;
        let team_list = [];
        
        teams.forEach(function(value){
            var team = {
                teamID: value.id,
                teamName: getTeamName(data.teams, value.id),
                win: 0,
                loss: 0,
                tie: 0,
                pts: 0
            };
            team_list.push(team);
        })
        console.log(team_list);
    
   
    scores.forEach(function (value) {
        
        //console.log(value.date);
        let games = value.games;
        
        games.forEach(function (value_games) {
            
            // Sets variables for home/away teams and scores
            let homeScore = value_games.home_score;
            let awayScore = value_games.away_score;
            
            let homeTeam = getTeamName(data.teams, value_games.home);
            let awayTeam = getTeamName(data.teams, value_games.away);
            
            
            
            
            
//             Check if Home Team Wins and give appropriate win/loss/pts
            if (homeScore > awayScore) {
                for (var i = 0; i < team_list.length; i++){ if ( value_games.home == team_list[i].teamID ) { team_list[i].win++; team_list[i].pts = team_list[i].pts + 2; } }
                for (var i = 0; i < team_list.length; i++){ if ( value_games.away == team_list[i].teamID ) { team_list[i].loss++; team_list[i].pts = team_list[i].pts + 0; } }            
            }
            // Check if Home Team Loses and give Appropriate win/loss/pts
            if (homeScore < awayScore) {
                for (var i = 0; i < team_list.length; i++){ if ( value_games.home == team_list[i].teamID ) { team_list[i].loss++; team_list[i].pts = team_list[i].pts + 0; } }
                for (var i = 0; i < team_list.length; i++){ if ( value_games.away == team_list[i].teamID ) { team_list[i].win++; team_list[i].pts = team_list[i].pts + 2; } }            
            }
            // Check if TIE and give appropriate ties/pts
            if (homeScore == awayScore) {
                for (var i = 0; i < team_list.length; i++){ if ( value_games.home == team_list[i].teamID ) { team_list[i].tie++; team_list[i].pts = team_list[i].pts + 1; } }
                for (var i = 0; i < team_list.length; i++){ if ( value_games.away == team_list[i].teamID ) { team_list[i].tie++; team_list[i].pts = team_list[i].pts + 1; } }            
            }
            
            console.log(awayTeam + " " + awayScore + " - " + homeScore + " " + homeTeam);
            
        })
        
        
        
    })
    
    console.log("\n\nStandings Page\n\n");
    team_list.sort(dynamicSort("pts"));
    
    team_list.forEach(function(value){
        
        let tbody = document.querySelector("#teamStandings tbody")
//        tbody.innerHTML = "";
        let wins = value.win;
        let losses = value.loss;
        let ties = value.tie;
        let points = value.pts;
        let name = value.teamName;
        let gp = value.win + value.loss + value.tie;
        
        let tr = document.createElement("tr");
//        let tlogo = document.createElement("td");
//        tlogo.innerHTML = teamLogo;
        let tdn = document.createElement("td");
        tdn.textContent = name;
        let tgp = document.createElement("td");
        tgp.textContent = gp;
        let tdw = document.createElement("td");
        tdw.textContent = wins;
        let tdl = document.createElement("td");
        tdl.textContent = losses;
        let tdt = document.createElement("td");
        tdt.textContent = ties;
        let tdp = document.createElement("td");
        tdp.textContent = points;
//        tr.appendChild(tlogo);
        tr.appendChild(tdn);
        tr.appendChild(tgp);
        tr.appendChild(tdw);
        tr.appendChild(tdl);
        tr.appendChild(tdt);
        tr.appendChild(tdp);
        tbody.appendChild(tr);
        
        
    })
    
}
    

function getTeamName(teams, id){
    for(let i = 0; i < teams.length; i++){
        if(teams[i].id == id){
            return teams[i].name;
        }
    }
    return "unknown";
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (b,a) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
