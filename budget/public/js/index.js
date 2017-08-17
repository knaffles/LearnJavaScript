$('#loading').css('opacity', 1);

$('#logout').hide();

$('#logout').on('click', function(e) {
  e.preventDefault();
  sessionStorage.clear();
  firebase.auth().signOut();
});

$('#login').on('click', function(e) {
  e.preventDefault();

  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
});

$('#sharing__save').on('click', function(e) {
  e.preventDefault();
  var masq = $('#sharing__ids').val();

  sessionStorage.setItem('masquerade', masq);
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $('#loading').hide();
    $('#links').show();
    $('#logout').show();

    // Get any shared accounts.
    var shared = getShared(user.uid);
    shared.then(function(snapshot) {
      sharedIds = snapshot.val();

      for (var id in sharedIds) {
        // Skip the loop if the property is from prototype.
        if (!sharedIds.hasOwnProperty(id)) continue;

        var username = getUsername(id);
        username.then(function(snapshot) {
          var option = '<option value="' + id + '">' + snapshot.val().name + '</option>';
          $(option).appendTo('#sharing__ids');
        });
      }
    });
  } else {
    // Hide the loading message, and enable the login button.
    $('#loading').hide();
    $('#login').show();
    $('#logout').hide();
    $('#links').hide();
  }
});

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;
  var uid = user.uid;
  var name = user.displayName;
  var email = user.email

  firebase.database().ref('user/' + uid ).set({
    'name': name,
    'email': email
  });

  // Write to email_to_users here


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

// Get accounts shared with me.
function getShared(uid) {
  return firebase.database().ref().child('friends').child(uid).once('value');
}

function getUsername(uid) {
  return firebase.database().ref('user/' + uid).once('value');
}