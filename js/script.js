var base = 'https://api.github.com/users/';
var rData = {},
	uData = {};

$(document).ready(function() {
	$('#username').focus();
});

$('#username').keyup(function (e) {
	if (e.keyCode === 13) {
		$('#content').empty();
		$('#messages').empty();
		var enteredText = $('#username').val();
		if (enteredText.length === 0) alert('Please enter a name!');
		else {
			if (enteredText == 'git help git') showHelp();
			else { 
				getUser(enteredText);
			}
			$('#username').val('');
		}
	}
});

function getUser(userName) {
	$.get(base + userName, function (userData) {
		uData = userData;
		$('#uname').append('<p>'+uData.name+'</p>');
	});
	getRepos(userName);
}

function getRepos(user) {
	var rCount = 0;
	$.get(base + user + '/repos', function (repoData) {
		rData = repoData;
		for (var repo in rData) {
			rCount++;
			//$('#repos').append('<p>'+rData[repo].name+'</p>');
		}
		$('#repos').append('<p>'+rCount+'</p>');
	});
}

function showHelp() {
	var help = 'Enter the username of the GitHub member for whose data you are looking for. Search filters coming soon.';	
	$('#messages').append('<p class = "help">$ '+help+'</p>');
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("messages").remove();
        });
    }, 5000);
}

function unrecognized() {
	var error = 'That user could not be found! Try again!';
	$('#messages').append('<p class = "error">'+error+'</p>');
	setTimeout(function() {
        $("#messages").fadeOut("slow", function() {
            $("messages").remove();
        });
    }, 5000);
}
