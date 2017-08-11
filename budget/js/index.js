$('#loading').css('opacity', 1);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.location = 'expenses.html';
  } else {
    // Hide the loading message, and enable the login button.
    $('#loading').hide();
    $('#login').show();
  }
});

firebase.auth().getRedirectResult().then(function(result) {
  console.log('redirect');

  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;

}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});

$('#login').on('click', function(e) {
  e.preventDefault();

  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
});