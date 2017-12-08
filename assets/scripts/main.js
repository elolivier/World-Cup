$(function () { 
	$.getJSON("https://api.myjson.com/bins/1bd1m3", function(data) { 
		var dataCup = data;
		var $scrollingDiv = $("#field-container");
		$(window).scroll(function(){			
			$scrollingDiv
			.stop()
			.animate({"marginTop": ($(window).scrollTop() + 0) + "px"}, "fast" );			
		});
		//-----------FILLING GAMES------------
		var i = 2;
		var k = i+2;
		var fieldLoader = [dataCup.dates[i].games[0].team1,dataCup.dates[i].games[0].team2,dataCup.dates[i].date,dataCup.dates[i].games[0].time,dataCup.dates[i].games[0].location];
		var missing_info = getMap(dataCup, dataCup.dates[i].games[0].location);
		while(i < k) {
        	$('#upcoming-game').append(getDay(dataCup.dates[i]));
			i++;
		}

		//-----------FILLING FIELD------------		
		fieldLoader.push(missing_info[0],missing_info[1],missing_info[2]);
		$('#field-container').html(getField(fieldLoader));

		//-----------FILLING STANDINGS------------
		$('#standings-container').html(getStandings(dataCup.groups));

		//-----------FILLING SCHEDULE------------
		$('#schedule-container').html(getGroups(dataCup));

		//-----------INITIAL CONDITION------------
		if(isLandscape()) {
			prepareIt(['#index-container','#field-container'], 'Next Matches');	
		} else {
			prepareIt(['#index-container'], 'Next Matches');
		}

		//-----------EVALUATE CLICK CONDITION------------
		//-----------HOME PAGE------------
		$('.glyphicon-home, .link_header').click(function() {
			if (isLandscape()) {
				prepareIt(['#index-container','#field-container'], 'Next Matches');
			} else {
				prepareIt(['#index-container'], 'Next Matches');
			}
		});
		//-----------SCHEDULE PAGE------------
		$('.more-games, #schedule').click(function() {
			window.scroll(0,0);
			if (isLandscape()) {
				$('.group').addClass('col-xs-5');
				prepareIt(['#schedule-container, #back-arrow'], 'Schedule');
			} else {
				prepareIt(['#schedule-container, #back-arrow'], 'Schedule');
			}
		});

		$('.flags').click(function() {
			var divTapped = this;
			var teamGroup = $(divTapped).children(':first').text();
			var groupToggle = getGroupToggle(dataCup.groups, teamGroup);	
			$(groupToggle).toggle();
		});
		//-----------GAME INFO------------
		$('.game').click(function() {
			$('#field-container').html(getField(getDataField(dataCup, this)));
			if (isLandscape()) {
				prepareIt(['#index-container','#field-container'], 'Next Matches');
			} else {
				prepareIt(['#field-container', '#back-arrow'], 'Field');
			}
		});
		//-----------STATS PAGE------------
		$('.glyphicon-stats').click(function() {
			if (isLandscape()) {
				$('.group-standing').addClass('col-xs-5');
				prepareIt(['#standings-container','.win', '.draw', '.lose', '#back-arrow'], 'Standings');
				$('.active').css('background-color', '#04326A');
			} else {
				prepareIt(['#standings-container', '#back-arrow'], 'Standings');
			}
		});
		$('.group-title').click(function() {
			var divTapped = this;
			var teamGroup = '.' + $(divTapped).text().trim().slice(-1);
			$(teamGroup).toggle();
		});
		//-----------CONTACT US------------
		$('.glyphicon-envelope').click(function() {
			location.href = "mailto:nysl@chisoccer.org";
		});
		//*********************CHAT***********************
		$('.glyphicon-comment').click(function() {
			firebase.auth().onAuthStateChanged(function(user) {
			  if (user) {
			    // User is signed in.
			    prepareIt(['#chat-container', '#back-arrow', '#signout'], 'Chat');
			    getPosts();
			  } else {
			    // No user is signed in.
			    prepareIt(['#login-container', '#back-arrow'], 'Login');
			  }
			});
		});

		$('#join').click(function() {
			prepareIt(['#signup-container', '#back-arrow'], 'Sign Up');
		});

		$('#signin').click(login);
		$('#signout').click(logOut);

		$('#signup').click(function() {
			newUser();
			prepareIt(['#chat-container', '#back-arrow'], 'Chat');
			getPosts();
		});
		$('#create-post').click(function() {
			if (($('#body').val() == "")) {
				alert('Please write something');
			} else {
				writeNewPost();
				$('#body').val("");
			}
		});
		//************************************************
		//-----------EVALUATE ORIENTATION CONDITION------------
		window.onorientationchange = orientationChanged; 	
	});
});

function orientationChanged() {
	var pageId = whichPage();
	if (window.orientation == 90 || window.orientation == -90) {
		switch(pageId) {
			case 'index-container':
				prepareIt(['#index-container','#field-container'], 'Next Matches');
				var $scrollingDiv = $("#field-container");
			break;
			case 'field-container':
				prepareIt(['#index-container','#field-container'], 'Next Matches');
			break;
			case 'standings-container':
				prepareIt(['#standings-container', '.win', '.draw', '.lose', '#back-arrow'], 'Standings');
				$('.win, .lose, .draw').css('background-color', '#04326A');
				$('.group-standing').addClass('col-xs-5');
				$('.focus').removeClass('font45');
			break;
			case 'schedule-container':
				$('.group').addClass('col-xs-5');
				$('.flags, .game-info').addClass('col-xs-12');
				$('.group, .flags, .game-info').removeClass('row');
			break;
		}
	} else {
		switch(pageId) {
			case 'index-container':
				prepareIt(['#index-container'], 'Next Matches');
			break;
			case 'field-container':
				prepareIt(['#index-container'], 'Next Matches');
			break;
			case 'standings-container':
				$('.group-standing').removeClass('col-xs-5');
				prepareIt(['#standings-container', '#back-arrow'], 'Standings');
			break;
			case 'schedule-container':
				$('.group').removeClass('col-xs-5');
				$('.focus').addClass('font45');
				$('.flags, .game-info').removeClass('col-xs-12');
				$('.group, .flags, .game-info').addClass('row');
			break;
		}
	}
}

function isLandscape() {
	var orientation = window.matchMedia("(orientation: landscape)").matches;
	return orientation;
}

function isShown() {
	var listShown = document.getElementsByClassName("active");
	return listShown;
}

function whichPage() {
	var arrayId = isShown();
	var containerId;
	$(arrayId).each(function(index, eachElement) {
		if (eachElement.id.indexOf("container") != -1) {
			containerId = arrayId[index].id;
		}
	});
	return containerId;
}

function prepareIt(toShow, pageTitle) {
	$(".active").removeClass("active");
	$(toShow).each(function(index, object) {
		$(object).addClass('active');
	});
	$('#page-title').html(pageTitle);
	if (pageTitle=="Next Matches") {
		$("#back-arrow").removeClass("active");
		$('#page-title').removeClass('col-xs-6');
		$('#page-title').addClass('col-xs-12');
	} else {
		$('#page-title').removeClass('col-xs-12');
		$('#page-title').addClass('col-xs-6');
	}
	showIt();
}

function showIt() {
	$('.active').show();
	$("div[id*='container'], nav, .win, .draw, .lose").not('.active').hide();
}

//*************************************
//***************CHAT******************
//*************************************
function login() {
    var email = $("#email").val();
    var pass = $("#pass").val();
	firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(function(){
        getPosts();
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      alert(errorCode);
      var errorMessage = error.message;
      alert(errorMessage);
    });
    $("#email").val("");
    $("#pass").val("");
}

function logOut() {
    firebase.auth().signOut().then(function () {
        alert("Logout success!");
    }, function (error) {
        alert("Unable to Logout!!!!");
    });
}

function newUser() {
    var email = $("#new-email").val();
    var pass = $("#new-pass").val();
    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(function(){
        getPosts();
        firebase.auth().onAuthStateChanged(function(user) {

            if (user) {
                // Updates the user attributes:
                var nameOfUser = $("#new-username").val();
                user.updateProfile({
                    displayName: nameOfUser
                }).then(function() {
                // Profile updated successfully!
                //  "NEW USER NAME"
                var displayName = user.displayName;
                }, function(error) {
                    alert(error);
                });     
            }   
        });
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      alert(errorCode);
      var errorMessage = error.message;
      alert(errorMessage);
    });
    $("#new-email").val("");
    $("#new-pass").val("");
    $("#new-username").val("");
}

function writeNewPost() {   
    var text = document.getElementById("body").value;   
    var userName = firebase.auth().currentUser.displayName;    
    var postData = {
        name: userName,
        body: text
    }

    var newPostKey = firebase.database().ref().child('myChat').push().key;
    var updates = {};
    updates[newPostKey] = postData;
    getPosts();
    return firebase.database().ref().child('myChat').update(updates);
}

function getPosts() {
    firebase.database().ref('myChat').on('value', function(data) {
        var logs = document.getElementById('posts');
        logs.innerHTML="";        
        var posts = data.val();
        var userName = firebase.auth().currentUser.displayName;
        for (var key in posts) {
            var text = document.createElement("div");
            var element = posts[key];
            if (element.name == userName) {
            	text.append(element.body);           
            	$(text).addClass("own-message");
            } else {
            	text.append(element.name + '\n');
            	text.append(element.body);
            	$(text).addClass("others-message");
            }
            logs.append(text);
        }
    })
}

//*************************************
//***************HTML******************
//*************************************
//*************HOME PAGE*************
function getDay(gameInfo) {
	var games_data = '<div class="row">';
	games_data += '<div class="text-center">';
	games_data += '<h1 class="day-header font45 font-blod background-light">';
	games_data += gameInfo.date + '</h1></div>';
	games_data += '<div class="dates">';
	games_data += getGamesOfDay(gameInfo.games);
	return games_data;
}

function getGamesOfDay(gamesOfDay) {
	var games_day = '';
	$(gamesOfDay).each(function(index, game_index) {
		games_day += '<div class="btn btn-primary btn-lg game ycenter background-img font45 font-white">';
		games_day += '<div class="col-xs-3 column-center">';
		games_day += '<img src="' + 'assets/images/flags/' + game_index.team1.toLowerCase().replace(/\s/g,'') + '.png" alt="Flag">';
		games_day += '<p class="font35">' + game_index.team1 + '</p></div>';
		games_day += '<div class="score col-xs-1 column-center"><p>' + game_index.result[0] + '</p></div>';
		games_day += '<div class="col-xs-4 column-center"><p>' + game_index.time + '</p><p>' + game_index.location + '</p></div>';
		games_day += '<div class="score col-xs-1 column-center"><p>' + game_index.result[1] + '</p></div>';
		games_day += '<div class="col-xs-3 column-center">';
		games_day += '<img src="' + 'assets/images/flags/' + game_index.team2.toLowerCase().replace(/\s/g,'') + '.png" alt="Flag">';
		games_day += '<p class="font35">' + game_index.team2 + '</p></div></div>';
	});
	return games_day;
}
//*************FIELD PAGE*************
function getField(data_field) {
	var field_data = '<div>';
	field_data += '<div class="teams dates"><div><img src="assets/images/flags/';
	field_data += data_field[0].toLowerCase().replace(/\s/g,'');
	field_data += '.png" alt="Flag"><p>' + data_field[0] + '</p></div><div><p>vs</p></div>';
	field_data += '<div><img src="assets/images/flags/' + data_field[1].toLowerCase().replace(/\s/g,'');
	field_data += '.png" alt="Flag"><p>' + data_field[1] + '</p></div></div>';
	field_data += '<p>' + data_field[2] + ' at ' + data_field[3] + '</p>';
	field_data += '<p class="field-name">' + data_field[5] + '</p></div><div id="field-map">';
	field_data += '<div class="div-address"><p class="address font-bold">' + data_field[6] + '</p></div>';
	field_data += '<object id="map" type="text/html" data="' + data_field[7];
	field_data += '" style="width:300px; height:200px; border:0;"></object></div></div>';
	return field_data;
}

function getDataField(all_info, game_check) {
	var temp = $(game_check).children();
	var team1 = $(temp[0]).text();
	var team2 = $(temp[4]).text();
	$(all_info.dates).each(function(index,day) {
		$(day.games).each(function(i, game) {
			if (team1 == game.team1 && team2 == game.team2) {
				temp = [team1, team2, day.date, game.time, game.location];
			}
		});
	});
	var info_sta = getMap(all_info, temp[4]);
	temp.push(info_sta[0], info_sta[1], info_sta[2]);
	return temp;
}

function getMap(all_info, stadium_name) {
	var map = []
	$(all_info.stadiums).each(function (j, stadium) {
		if (stadium_name == stadium.short_name) {
			map.push(stadium.long_name, stadium.address, stadium.map);
		}
	});
	return map;
}

//*************STANDINGS PAGE*************
function getStandings(dataGames) {
	var stand = '';
	$(dataGames).each(function(n, eachGroup) {
		stand += getDataGroup(eachGroup);
	});
	return stand;
}

function getDataGroup(eachGroup) {
	var data_group = '';
	data_group += '<div class="text-center group-standing"><h2 class="group-title font45 font-bold background-light">GROUP ';
	data_group += eachGroup.group + '</h2><table class="table ' + eachGroup.group + ' font-bold font35 font-white">';
	data_group += '<thead><th class="font-bold font35 text-center">Pos</th><th>Club</th><th class="font-bold font35 text-center">P</th>';
	data_group += '<th class="font-bold font35 text-center win" style="display: none;">W</th><th class="font-bold font35 text-center draw" style="display: none;">D</th>';
	data_group += '<th class="font-bold font35 text-center lose" style="display: none;">L</th><th class="font-bold font35 text-center">GD</th>';
	data_group += '<th class="font-bold font35 text-center">Pts</th></tr></thead><tbody>';
	data_group += getTeam(eachGroup) + '</tbody></table></div>';
	return data_group;
}

function getTeam(eachGroup) {
	var data_team = '';
	$(eachGroup.members).each(function(i, team) {
		var num_team = eachGroup.standing[i];
		data_team += '<tr><td>' + num_team[0] + '</td><td class="focus font45">' + team + '</td>';
		data_team += '<td>' + num_team[1] + '</td><td class="win" style="display: none;">';
		data_team += num_team[2] + '</td><td class="draw" style="display: none;">';
		data_team += num_team[3] + '</td><td class="lose" style="display: none;">';
		data_team += num_team[4] + '</td><td>' + num_team[5] + '</td><td>' + num_team[6] + '</td></tr>';
	});
	return data_team;
}

//*************SCHEDULE PAGE*************
function getGroups(dataCup) {
	var data_fill ='';
	$(dataCup.groups).each(function(i, eachGroup) {
		data_fill += '<div class="group row"><div class="group-name font-bold font45 text-center background-light"><p>GROUP ';
		data_fill += eachGroup.group + '</p></div><div class="row flags font-white font35">';
		data_fill += getTeams(eachGroup) + '</div>';
		data_fill += getGamesOfGroup(dataCup, eachGroup);
		data_fill += '</div>';
	});
	return data_fill;
}

function getTeams(eachGroup) {
	var team_fill = '';
	$(eachGroup.members).each(function(j, team) {
		team_fill += '<div class="col-xs-3"><img src="assets/images/flags/' + team.toLowerCase().replace(/\s/g,'') + '.png" alt="Flag">';
		team_fill += '<p>' + team + '</p></div>';
	});
	return team_fill;
}

function getGamesOfGroup(dataCup, eachGroup) {
	var game_fill='';
	$(dataCup.dates).each(function(j, eachDate) {
		$(eachDate.games).each(function(k, game) {
			if (game.group == eachGroup.group) {
				game_fill += '<div class="row game-info background-img font35 font-white'+ ' ' + game.group +'"><div class="game-date"><p class="date">';
				game_fill += eachDate.date + ' - ' + game.time + '</p><p class="stadium">' + game.location + '</p></div>';
				game_fill += '<div class="game-teams"><div class="col-xs-5 team1 ycenter"><img src="assets/images/flags/';
				game_fill += game.team1.toLowerCase().replace(/\s/g,'') + '.png" alt="Flag"><p>' + game.team1 + '</p></div><div class="col-xs-2"><p class="versus">vs</p></div>';
				game_fill += '<div class="col-xs-5 team2 ycenter"><p>' + game.team2 + '</p><img src="assets/images/flags/' + game.team2.toLowerCase().replace(/\s/g,'');
				game_fill += '.png" alt="Flag"></div></div></div>';
			}
		});
	});
	return game_fill;
}

function getGroupToggle(allGroups, teamGroup) {
	var groupToggle;
	$(allGroups).each(function(i, eachGroup) {
		$(eachGroup.members).each(function(j, team) {
			if (teamGroup == team) {
				groupToggle = '.' + eachGroup.group;
			}
		});
	});
	return groupToggle;
}