var base = 'https://api.github.com/users/';
var rData = {},
	uData = {};

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
		$('#top-bar').empty();
		$('#data').hide();
		$('#messages').empty();
		var enteredText = $('#username').val();
		if (enteredText.length === 0) alert('Please enter a name!');
		else {
			if (enteredText == 'git help git') showHelp();
			else { 
				$('.spinner').show();
				getUser(enteredText);
			}
			$('#username').val('');
		}
	}
});

//Get user data using GitHub API
function getUser(userName) {
	$.get(base + userName, function (userData) {
		uData = userData;
		$('#search').fadeOut(750, function () {
			$('#data').fadeIn(500);
		});
		$('#top-bar').append('<span id = "uname" style = "margin-left: 0.3em;">'+uData.name+'</span>');
		$('#top-bar').append('<span id = "membersince" style = "margin-left: 1em;"> committing since '+(uData.created_at).substring(0,10)+'</span>');
		
		$("#home").wrap('<a href="'+uData.blog+'"></a>');
		$("#code").wrap('<a href="'+uData.html_url+'"></a>');
		$('#content').append('<span class = "stat">'+uData.public_repos+'</span><span class = "desc"> public repositories.</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;">'+uData.followers+'</span><span class = "desc"> followers.</span>');
		$('#content').append('<span class = "stat" style = "padding-left: 0.3em;">'+uData.public_gists+'</span><span class = "desc"> gists.</span>');
		$('#content').append('<span class = "desc" style = "padding-left: 0.3em;">Works at </span><span class = "stat">'+uData.company+'</span><span class = "desc">.</span>');
	});
	getOrgs(userName);
	getRepos(userName);
}

//Get users' organization info using GitHub API
function getOrgs(username) {
	var orgCount = 0;
	var oData = {};
	$.get(base + username+'/orgs', function (orgData) {
		oData = orgData;
		alert(oData);
		for (var orgs in oData) {
			orgCount++;
		}
	});
}

//Get users' repo data using GitHub API
function getRepos(user) {
	$.get(base + user + '/repos', function (repoData) {
		rData = repoData;
	});
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

//Error message - not implemented fully yet
function unrecognized() {
	var error = 'That user could not be found! Try again!';
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
			$('.spinner').hide();
			$('#username').focus();
		});
});
