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
				$('#search').hide();
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
		$('.spinner').fadeOut(750, function () {
			$('#data').fadeIn(500);
		});
		//$('#content').append('<img src = "images/search_blk.png" id = "go-back"/>');
		$('#content').append('<span  id = "uname">'+uData.name+'</span>');
		$('#content').append('<span p id = "membersince"> member since '+(uData.created_at).substring(0,10)+'</span>');
	});
	getRepos(userName);
}

//Get users' repo data using GitHub API
function getRepos(user) {
	var rCount = 0;
	$.get(base + user + '/repos', function (repoData) {
		rData = repoData;
		for (var repo in rData) {
			rCount++;
			//$('#repos').append('<p>'+rData[repo].name+'</p>');
		}
		//$('#content').append('<p id = "repos">'+rCount+'</p>');
	});
}

//Help message
function showHelp() {
	var help = 'Enter the username of the GitHub member for whose data you are looking for. Search filters coming soon.';	
	$('#messages').append('<p class = "help">'+help+'</p>');
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").remove();
        });
    }, 5000);
}

//Error message - not implemented fully yet
function unrecognized() {
	var error = 'That user could not be found! Try again!';
	$('#messages').append('<p class = "error">'+error+'</p>');
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("#messages").remove();
        });
    }, 5000);
}

// Take user back to search screen
$( '#go-back' ).click(function() {
		$('#data').fadeOut(750, function () {
			$('#search').fadeIn(500);
			$('#username').focus();
		});
});
