// Get a reference to the database service
var database = firebase.database();

// Load budget categories
$.getJSON('./data/categories.json', function(data) {
  processCategories(data);
});

// Loop through each one
function processCategories(data) {
  for (var i = 0; i < data.length; i++) {
    writeCategory(data[i]);
  }
}

// Save to firebase.
function writeCategory(data) {
  firebase.database().ref('category/' + encodeURIComponent(data.Category)).set({
    Category: data.Category,
    'Parent Category': data['Parent Category'],
    Envelope : data.Envelope
  });
}

// Get all categories.
function getCategories() {
  return firebase.database().ref('category').once('value')
}