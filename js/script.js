//Global variables
var base = 'https://api.github.com/users/';
var rData = {},
	uData = {};
var langChart, uName;

// Run on load
$(document).ready(function() {
	$('#username').focus();
	$('#data').hide();
	$('.spinner').hide();
});

//Detect 'Enter' key being pressed
$('#username').keyup(function (e) {
	if (e.keyCode === 13) {
		$('#content').empty(); 
		$('#orgz').empty();
		$('#top-bar').empty();
		$('#data').hide();
		$('#messages').empty();
        $('#repos').empty();
		$('#API').hide();
		var enteredText = $('#username').val();
		if (enteredText.length === 0) unrecognized(enteredText);
		else {
			if (enteredText == 'git help') showHelp();
			else if (enteredText == 'git info') showInfo();
			else if (enteredText == 'username') showOops();
			else { 
				$('.spinner').show();
				getData(enteredText);
			}
			$('#username').val('');
		}
	}
});

//Get user data using GitHub API
function getData(userName) {
	$.get(base + userName, function (userData) {
		uData = userData;
		$('#search').fadeOut(750, function () {
			$('#data').fadeIn(500);
			$('#footer').fadeOut();
		});
		//Check that the user has a defined full name or use their username if they don't
		uName = userName;
		var	uBlog = uData.blog, uCompany = uData.company, uLocation = uData.location;
		
		//Check for any required information that is null
		if (uData.name !== null && uData.name !== undefined && uData.name.length) { 
            uName = uData.name;
        }
		
		if (uBlog === null || uBlog === undefined || !uBlog.length) {
			$('#home').hide();
		}
		
		if (uCompany === null || uCompany === undefined || !uCompany.length) {
			uCompany = 'a secret location';
		}
		
		if (uLocation === null || uLocation === undefined || !uLocation.length) {
			uLocation = 'a hidden safe house';
		}
		
		document.title = uName + '\'s résumé';
		
		$('#top-bar').append('<span id = "uname" style = "margin-left: 0.3em;">'+uName+'</span>');
		$('#top-bar').append('<span id = "membersince" style = "margin-left: 1em;"> has been committing since '+(uData.created_at).substring(0,10)+'</span>');
		$("#home").wrap('<a href="'+uBlog+'" target="_blank"></a>');
		$("#code").wrap('<a href="'+uData.html_url+'" target="_blank"></a>');
		$('#content').append('<span class = "desc">Since then, they have amassed </span>');
		$('#content').append('<span class = "stat">'+uData.public_repos+'</span><span class = "desc"> public repositories,</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;">'+uData.followers+'</span><span class = "desc"> followers and</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;">'+uData.public_gists+'</span><span class = "desc"> gists.</span></br>');
		$('#content').append('<span class = "desc">'+((uName).split(" "))[0]+' currently works at </span><span class = "stat">'+uCompany+'</span>');
        $('#content').append('<span class = "desc"> and lives in </span><span class = "stat">'+uLocation+'</span><span class = "desc">.</span>');
		
		//Get users' organization info
		var orgCount = 0;
		var oData = {};
		var orgs = [];
		$.get(base + userName+'/orgs', function (orgData) {
			oData = orgData;
			$.each(oData, function(i, orgInf) {
				orgCount++;
				orgs.push({info:orgInf});
			});
			if (orgCount === 0) {
				$('#orgz').hide();
			} else {
				$('#orgz').show();
				$('#orgz').append('<span class = "desc">'+((uName).split(" "))[0]+' is a member of</span><span class = "stat"> '+orgs[0].info.login+'</span><span class = "desc"> and </span>');
				if ((orgCount - 1) === 1) {
					$('#orgz').append('<span class = "stat"> '+orgs[1].info.login+'</span>.');
				} else { 
					$('#orgz').append('<span class = "stat"> '+(orgCount - 1)+'</span><span class = "desc"> other organizations.</span>');
				}
			}
		});
	});

	//Get users' repo data using GitHub API
	var repos = [],
		uLang = [],
		langList = [], 
		repoInf,
		finished = false,
		page = 1;

	var ctx = document.getElementById("lang-chart").getContext("2d");
	var data = [];
	langChart = new Chart(ctx).Doughnut(data, {animateScale: true,animationEasing : "easeOutExpo",segmentStrokeWidth : 2});
	getRepos(page);
	
	function getRepos(pageNum) {
		$.get(base+userName+'/repos?&page='+pageNum, function (repoData) {
		rData = repoData;
			if (repoData.length !== 0) {
				$.each(repoData, function(i, repoInf) {
					repos.push({info:repoInf});
				});
				
				repos.sort(sortByStars);

				for (var i = 0; i < repos.length; i++) {
					if (repos[i].info.language) {
						if (langList.indexOf(repos[i].info.language) === -1) {
							uLang.push({val:1, label:repos[i].info.language});
							langList[langList.length] = repos[i].info.language;
						} else {
							uLang[langList.indexOf(repos[i].info.language)].val++;
						}
					}
				}
			} else {
				finished = true;
			}			
		}).done(function() {
			if (finished === true) {
				$('#header').append(((uName).split(" "))[0]+'\'s most popular Repos and most used languages');
				$('#repos').append('<table><thead><tr><th>Repo Name</th><th>Stars</th><th>Forks</th></tr></thead><tbody><tr><td>'+repos[0].info.name+'</td><td style="text-align:center;">'+repos[0].info.stargazers_count+'</td><td style="text-align:center;">'+repos[0].info.forks_count+'</td></tr><tr><td>'+repos[1].info.name+'</td><td style="text-align:center;">'+repos[1].info.stargazers_count+'</td><td style="text-align:center;">'+repos[1].info.forks_count+'</td></tr><tr><td>'+repos[2].info.name+'</td><td style="text-align:center;">'+repos[2].info.stargazers_count+'</td><td style="text-align:center;">'+repos[2].info.forks_count+'</td></tr><tr><td>'+repos[3].info.name+'</td><td style="text-align:center;">'+repos[3].info.stargazers_count+'</td><td style="text-align:center;">'+repos[3].info.forks_count+'</td></tr><tr><td>'+repos[4].info.name+'</td><td style="text-align:center;">'+repos[4].info.stargazers_count+'</td><td style="text-align:center;">'+repos[4].info.forks_count+'</td></tr></tbody></table>'); 
				for (var i = 0; i < langList.length; i++) {
					langChart.addData({
						value: uLang[i].val,
						color: Please.make_color(),
						label: uLang[i].label
					});
				}
			} else {
				page++
				getRepos(page);
			}
		});
	}
}

//Sort repos by stars
function sortByStars(a, b) {
		return b.info.stargazers_count - a.info.stargazers_count;
}

//Help message
function showHelp() {
	var help = 'Enter the username of the GitHub member you are looking for.';
	$('#messages').append('<p class = "help">'+help+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 5000);
}

//Information about Committed
function showInfo() {
	var info = 'Committed is not affiliated with GitHub, it simply uses the <a href = "https://developer.github.com">GitHub API</a>.</br>Committed was made with &hearts; by <a href = "http://nischaal.me">Nischaal Cooray</a> and is licensed under the MIT license.</br>Check out <a href ="https://github.com/nischaalc/committed">Committed</a> on GitHub!</br>Committed is NOT optimized for mobile devices YET!'
	$('#messages').append('<p class = "info">'+info+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 9000);
}

//Oops
function showOops() {
	var oops = 'Ah! Hello! I see that I didn\'t make myself understandable enough - sorry about that.</br>What I meant was to enter the username of the user that you are trying to find information about.</br>Now go get \'em!';
	$('#messages').append('<p class = "oops">'+oops+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 9000);
}
//Error message - not implemented fully yet
function unrecognized(text) {
	var error = '';
	if (text.length == 0) error = 'I ain\'t silly, I know you didn\'t type anything!</br>Try again!';
	else error = 'Ah shucks... I couldn\'t find that user... Would you give me another chance?';
	$('#messages').append('<p class = "error">'+error+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 5000);
}

// Take user back to search screen
$( '#go-back' ).click(function() {
		$('#data').fadeOut(500, function () {
			$('#search').fadeIn(500);
			$('#API').fadeIn(500);
			$('.spinner').hide();
			$('#username').focus();
			langChart.destroy();
		});
	$('#home').show();
	document.title = 'Committed';
});
