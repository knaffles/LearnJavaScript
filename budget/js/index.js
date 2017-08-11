firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.location = 'expenses.html';
  } else {
    // Do nothing
  }
});

// firebase.auth().getRedirectResult().then(function(result) {
//   console.log('Result from getRedirectResult:');
//   console.log(result)

//   if (result.credential) {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     var token = result.credential.accessToken;
//     // ...
//   }
//   // The signed-in user info.
//   var user = result.user;

//   $('body').append('<p>Got redirect result!</p>');
// }).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });

$('#login').on('click', function(e) {
  e.preventDefault();

  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
});