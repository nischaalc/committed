//Global variables
var base = 'https://api.github.com/users/',	
	htmlBase = 'https://github.com/',
	googleBase = 'https://www.google.com/#q=',
	rData = {},
	uData = {},
	eData = {},
	langChart, eventChart, uName;

// Run on load
$(document).ready(function() {
	$('#username').focus();
	$('#data').hide();
	$('.spinner').hide();
});

//Detect 'Enter' key being pressed
$('#username').keyup(function (e) {
	if (e.keyCode === 13) {
		$('#content').empty(); //Empty containers to prevent data overflow
		$('#orgz').empty();
		$('#top-bar').empty();
		$('#messages').empty();
        $('#repos').empty();
		$('#llegend').empty();
		$('#org-images').empty();
		$('#eheader').empty();
		$('#lheader').empty();
		$('#data').hide(); //Hide containers to prevent FOUC
		$('#API').hide();
		$('#rep-cont').hide();
		$('#lang-cont').hide();
		$('#org-cont').hide();
		var enteredText = ($('#username').val()).trim();
		if (enteredText.length === 0) unrecognized();
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
		
		if (uData.email === null || uData.email === undefined || !uData.email) {
			$('#mail').hide();
		}
		
		if (uCompany === null || uCompany === undefined || !uCompany.length) {
			uCompany = 'a secret location';
		}
		
		if (uLocation === null || uLocation === undefined || !uLocation.length) {
			uLocation = 'a hidden safe house';
		}
		
		document.title = uName;

		$('#top-bar').append('<span id = "uname" style = "margin-left: 0.3em;">'+uName+'</span>');
		$('#top-bar').append('<span id = "membersince" style = "margin-left: 1em;"> has been committing since '+(uData.created_at).substring(0,10)+'</span>');
		$("#home").wrap('<a href="'+uBlog+'" target="_blank"></a>');
		$("#code").wrap('<a href="'+uData.html_url+'" target="_blank"></a>');
		$("#mail").wrap('<a href="mailto:'+uData.email+'" target="_blank"></a>');
		$('#content').append('<span class = "desc">Since then, they have amassed </span>');
		$('#content').append('<span class = "stat"><a href = "'+(htmlBase+userName+'?tab=repositories')+'" target = _blank>'+uData.public_repos+'</a></span><span class = "desc"> public repositories,</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;"><a href = "'+(htmlBase+userName+'/followers')+'" target = _blank>'+uData.followers+'</a></span><span class = "desc"> followers and</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;"><a href = "https://gist.github.com/'+userName+'" target = _blank>'+uData.public_gists+'</a></span><span class = "desc"> gists.</span></br>');
		
		if (uData.type === 'Organization') {
			$('#content').append('<span class = "desc">'+((uName).split(/[^A-Za-z0-9]/))[0]+' is an organization based in </span><span class = "stat"><a href = "'+(googleBase+uLocation)+'" target = _blank>'+uLocation+'</a></span><span class = "desc">.</span>');
		} else {
			$('#content').append('<span class = "desc">'+((uName).split(/[^A-Za-z0-9]/))[0]+' currently works at </span><span class = "stat"><a href = "'+(googleBase+((uCompany).split(/[^A-Za-z0-9 ]/))[0])+'" target = _blank>'+((uCompany).split(/[^A-Za-z0-9 ]/))[0]+'</a></span>');
			$('#content').append('<span class = "desc"> and lives in </span><span class = "stat"><a href = "'+(googleBase+((uLocation).split(/[^A-Za-z0-9, ]/))[0])+'" target = _blank>'+((uLocation).split(/[^A-Za-z0-9, ]/))[0]+'</a></span><span class = "desc">.</span>');
		}

		//Get users' repo data
		var repos = [],
			uLang = [],
			langList = [], 
			repoInf,
			finished = false,
			rpage = 1,
			epage = 1;

		var ctx = document.getElementById("lang-chart").getContext("2d");
		var data = [];
		langChart = new Chart(ctx).Doughnut(data, {animateScale: true,animationEasing : "easeOutExpo",segmentStrokeWidth : 2});
		getRepos(rpage);
		
		function getRepos(pageNum) {
			$.get(base+userName+'/repos?&page='+pageNum, function (repoData) {
				rData = repoData;
				if (repoData.length !== 0) {
					$.each(repoData, function(i, repoInf) {
						repos.push({info:repoInf});
					});
					
					repos.sort(sortByPop);

					for (var i = 0; i < repos.length; i++) {
						if (repos[i].info.language) {
							if (langList.indexOf(repos[i].info.language) === -1) {
								uLang.push({val:1, label:repos[i].info.language, percentage:'', color:''});
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
					getPerc(uLang);
					$('#lheader').append('Their '+langList.length+' most used languages');
					$('#repos').append('<table><thead><tr><th>Repo Name</th><th>Stars</th><th>Forks</th><th>Description</th></tr></thead><tbody><tr><td><a href = "'+repos[0].info.html_url+'" target = _blank>'+repos[0].info.name+hasHome(repos,0)+'</a></td><td style="text-align:center;">'+repos[0].info.stargazers_count+'</td><td style="text-align:center;">'+repos[0].info.forks_count+'</td><td>'+repos[0].info.description+'</td></tr><tr><td><a href = "'+repos[1].info.html_url+'" target = _blank>'+repos[1].info.name+hasHome(repos,1)+'</td><td style="text-align:center;">'+repos[1].info.stargazers_count+'</td><td style="text-align:center;">'+repos[1].info.forks_count+'</td><td>'+repos[1].info.description+'</td></tr><tr><td><a href = "'+repos[2].info.html_url+'" target = _blank>'+repos[2].info.name+hasHome(repos,2)+'</td><td style="text-align:center;">'+repos[2].info.stargazers_count+'</td><td style="text-align:center;">'+repos[2].info.forks_count+'</td><td>'+repos[2].info.description+'</td></tr><tr><td><a href = "'+repos[3].info.html_url+'" target = _blank>'+repos[3].info.name+hasHome(repos,3)+'</td><td style="text-align:center;">'+repos[3].info.stargazers_count+'</td><td style="text-align:center;">'+repos[3].info.forks_count+'</td><td>'+repos[3].info.description+'</td></tr><tr><td><a href = "'+repos[4].info.html_url+'" target = _blank>'+repos[4].info.name+hasHome(repos,4)+'</td><td style="text-align:center;">'+repos[4].info.stargazers_count+'</td><td style="text-align:center;">'+repos[4].info.forks_count+'</td><td>'+repos[4].info.description+'</td></tr></tbody></table>'); 
					var currentColor;
					for (var i = 0; i < uLang.length; i++) {
					currentColor = randomColor();
					uLang[i].color = currentColor;
						langChart.addData({
							value: uLang[i].val,
							color: currentColor,
							label: uLang[i].label
						});
					}
					var listString = '<ul>';
					for (var i = 0; i < uLang.length; i++) {
						listString += '<li style = "color:'+uLang[i].color+';"><b>'+uLang[i].label + ': ' + uLang[i].percentage + ' %</b><li>';
					}
					
					listString += '</ul>';
					$('#llegend').append(listString);
					$('#rep-cont').fadeIn(500);
					$('#lang-cont').fadeIn(500);
					getOrgs();
				} else {
					rpage++
					getRepos(rpage);
				}
			});
		}
		
		//Get users' organization info
		function getOrgs() {
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
					$('#orgz').append('<span class = "desc">'+((uName).split(/[^A-Za-z0-9]/))[0]+' is not a member of any public organizations.</br>This could either mean that they aren\'t part of any organizations... or they\'re in secret ones!</span>');
					$('#org-images').append('<a href = "http://en.wikipedia.org/wiki/Secret_society" target = _blank><img src = "images/nopubrep.png" /></a>');
				} else {
					if (orgCount === 1) {
						$('#orgz').append('<span class = "desc">'+((uName).split(/[^A-Za-z0-9]/))[0]+' is a member of </span><span class = "stat"><a href = "'+orgs[0].info.url+'" target = _blank>'+orgs[0].info.login+'</a></span><span class = "desc">.</span>');
					} else {
						$('#orgz').append('<span class = "desc">'+((uName).split(/[^A-Za-z0-9]/))[0]+' is a member of '+orgCount+' public organizations.</span>');
					}
					
					for (var i = 0; i < orgs.length; i++) {
							$('#org-images').append('<a href="'+(htmlBase+orgs[i].info.login)+'" target=_blank><img src = "'+orgs[i].info.avatar_url+'"/><div class = "caption">'+orgs[i].info.login+'</div></a>');
					}	
				}
			}).done(function() {
				getEvents(epage);
				$('#org-cont').fadeIn(500);
			});
		}
		
		var createCount = 0, forkCount = 0, issueCount = 0, pullCount = 0, commitCount = 0, totalEvents = 0, firstDate, secondDate;
		
		//Get users recent activity
		function getEvents(pageNum) {
			var	events = [],
				completed = false,
				eventType;

			$.get(base+userName+'/events?&page='+pageNum, function (eventData) {
				if (pageNum === 5) completed = true;
				eData = eventData;
				if (eData.length !== 0) {
					$.each(eventData, function(i, eventInf) {
						events.push({info:eventInf});
					});
					
					if (pageNum === 1) firstDate = ((events[0].info.created_at).substr(0,10)).replace(/-/g,'/');
					
					for (var i = 0; i < events.length;i++) {
						eventType = events[i].info.type;
						secondDate = ((events[i].info.created_at).substr(0,10)).replace(/-/g,'/');
						
						switch(eventType) {
							case 'CreateEvent':
								createCount++;
								break;
							case 'ForkEvent':
								forkCount++;
								break;
							case 'IssuesEvent':
								issueCount++;
								break;
							case 'PullRequestEvent':
								pullCount++;
								break;
							case 'PushEvent':
								commitCount++;
								break;
						}
					}
				} else {
					completed = true;
				}
			}).done(function() {
				if (completed === true) {
					var cty = document.getElementById("event-chart").getContext("2d");
					var eData = {
						labels: ["Creations", "Forks", "Issues", "Pulls", "Commits"],
						datasets: [
							{
								label: "Event Data",
								fillColor: randomColor(),
								data: [createCount, forkCount, issueCount, pullCount, commitCount]
							}
						]
					};

					totalEvents = createCount + forkCount + issueCount + pullCount + commitCount;
					eventChart = new Chart(cty).Bar(eData, {});	
					$('#eheader').append('Between '+firstDate+ ' and '+secondDate+' there are '+totalEvents+' key events recorded for '+((uName).split(/[^A-Za-z]/))[0]+'.');
					$('#eheader').append('<ul><li><i style = "margin-right:0.3em;">Creations</i>  represent when the user creates a repository, branch, or tag.</li><li><i style = "margin-right:0.3em;">Forks</i>  represent when the user forks a repo, or one of their repo\'s is forked.</li><li><i style = "margin-right:0.3em;">Issues</i>  represent when the user triggers an issue or makes an impact on its\' state.</li><li><i style = "margin-right:0.3em;">Pulls</i>  represent when the user triggers a pull request or makes an impact on it\'s state.</li><li><i style = "margin-right:0.3em;">Commits</i>  represent when the user pushes to a repo they own or contribute to.</li></ul>');
					$('#event-cont').fadeIn(500);
				} else {
					epage++;
					getEvents(epage);
				}
			});	
		}
	}).done(function() {
		$('#search').fadeOut(750, function () {
			$('#data').fadeIn(800);
			$('#footer').fadeOut();
		});
	})
	.fail(function() {
		unrecognized();
	});
			
}

// Check if a repo has an external homepage
function hasHome(repos, i) {
	if (repos[i].info.homepage) {
		return ('<a href = "'+repos[i].info.homepage+'" target = _blank><img src = "images/link.png" /></a>');
	} else {
		return '';
	}
}

//Calculate the percentage use of the users languages
function getPerc(uLang) {
	var grandTot = 0;
	for (var i = 0; i < uLang.length; i++) {
		grandTot +=uLang[i].val;
	}
	
	for (var j = 0; j < uLang.length; j++) {
		uLang[j].percentage = (Math.round((uLang[j].val/grandTot)*100));
		if (uLang[j].percentage === 0) {
			uLang[j].percentage = '>1';
		}
	}
}

//Sort repos by stars + forks
function sortByPop(a, b) {
		return ((b.info.stargazers_count + b.info.forks_count) - (a.info.stargazers_count + a.info.forks_count));
}

//Help message
function showHelp() {
	var help = '# To search, enter the username of the GitHub user you are looking for.</br># The BIG blue words and numbers are links.</br># Click on a repo name to be taken to its GitHub page.</br># The <img src = "images/link.png" /> icon next to a repo name indicates that a project has an external homepage (in addition to the listing on GitHub) - click it to be taken there.</br># That\'s it! Thank you for using Committed!';
	$('#messages').append('<p class = "help">'+help+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 9000);
}

//Information about Committed
function showInfo() {
	var info = '# Committed is not affiliated with GitHub, it simply uses the <a href = "https://developer.github.com">GitHub API</a>.</br># Committed was made with &hearts; by <a href = "http://nischaal.me">Nischaal Cooray</a> and is licensed under the MIT license.</br># Fork <a href ="https://github.com/nischaalc/committed">Committed</a> on GitHub!</br># Committed is NOT optimized for mobile devices YET!'
	$('#messages').append('<p class = "info">'+info+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 9000);
}

//Tell the user that they aren't literally meant to enter 'username'
function showOops() {
	var oops = '# Ah! Hello! I see that I didn\'t make myself understandable enough - sorry about that.</br># What I meant was to enter the username of the user that you are trying to find information about.</br># Now go get \'em!';
	$('#messages').append('<p class = "oops">'+oops+'</p>');
	$('#messages').show();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 9000);
}

//Error message if user not found
function unrecognized() {
	var error = '# Ah shucks... I couldn\'t find that user... Would you give me another chance?';
	$('#messages').append('<p class = "error">'+error+'</p>');
	$('#messages').show();
	$('.spinner').hide();
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").hide();
        });
    }, 7000);
}

// Take user back to search screen
$( '#go-back' ).click(function() {
		$('#data').fadeOut(500, function () {
			$('.spinner').hide();
			langChart.destroy();
			eventChart.destroy();
			$('#search').fadeIn(500);
			$('#API').fadeIn(500);
			$('#username').focus();
		});
	document.title = 'Committed';
});

//Ensure that the user doesn't lose the input box :D
$('#username').focusout(function() {
	$('#username').focus();
});
