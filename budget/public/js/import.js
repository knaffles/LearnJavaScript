// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [];
    var headers = [];
    var headersFound = false;
    var headerIndex = 0;

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( {} );
            headersFound = true;
            headerIndex = 0;
        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ),"\"");
            

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }

        if (!strMatchedValue) { strMatchedValue = '' }

        // Now that we have our value string, let's add
        // it to the data array.
        if (!headersFound) {
          headers.push(strMatchedValue);
        } else {
          arrData[arrData.length -1][headers[headerIndex]] = strMatchedValue;
          headerIndex ++;
        }
    }

    // Return the parsed data.
    return( arrData );
}

function csvFileToJSON(file) {
  if (!window.FileReader || !window.File) {
    return Promise.reject('Does not support File API');
  }
  if (!(file instanceof File)) {
    return Promise.reject('Not a file');
  }

  return new Promise(function(resolve, reject) {
    var reader = new FileReader();

    reader.onerror = function(err) {
      reject(err);
    };

    // Closure to capture the file information.
    reader.onload = function() {
      var text = reader.result;
      resolve(CSVToArray(text));
    };

    // Read in the image file as a data URL.
    reader.readAsText(file);
  });
}


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var uid = user.uid;    var uid = user.uid;

    var masquerade = sessionStorage.getItem('masquerade');
    if (masquerade) {
      uid = masquerade;
    }
    
    $('#import button').on('click', function() {
      var data = $('#import__data').val(),
          option = $('#import__option').val();

      try {
        data = JSON.parse(data);
      } catch (e) {
        showError('Import was not successful: ' + e.message);
        data = [];
      }

      if (data.length > 0) {
        switch (option) {
          case 'budget':
            clearNode('budget/' + uid).then(processBudget(data, uid));
            break;

          case 'categories':
            clearNode('category/' + uid).then(processCategories(data, uid));
            break;

          case 'transactions':
            clearNode('transaction/' + uid).then(processTransactions(data, uid));
            break;
        }
      }
    });

    $('#import-transactions button').on('click', function() {
      var file = $('#import-transactions__data')[0].files[0];
      var result = csvFileToJSON(file);

      result.then(function(data) {

        // Check for bad data at the end of the array.
        // This happens when the last row is a blank line.
        // TODO find a better way to do this.
        if (data[data.length - 1].Date === '') {
          data.pop();
        }

        clearNode('transaction/' + uid).then(processTransactions(data, uid));
      });
    });

    $('#share button').on('click', function(e) {
      e.preventDefault();
      var email = $('#share__email').val();

      writeShareEmail(email, uid);
    })
  } 
});