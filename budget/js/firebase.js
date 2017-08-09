// Get a reference to the database service
var database = firebase.database();

// Clear all entries in a node.
function clearNode(node) {
  return database.ref(node).remove();
}

// Loop through each category.
function processCategories(data) {
  for (var i = 0; i < data.length; i++) {
    writeCategory(data[i]);
  }
}

// Loop through each budget entry.
function processBudget(data) {
  for (var i = 0; i < data.length; i++) {
    writeBudget(cleanBudget(data[i]));
  }
}

// Loop through each transaction.
function processTransactions(data) {
  var transactionRef = database.ref('transaction');

  for (var i = 0; i < data.length; i++) {
    writeTransaction(cleanTransaction(data[i]), transactionRef);
  }
}

// Clean budget entries.
function cleanBudget(entry) {
  entry.Month  = parseInt(entry.Month);
  entry.Year   = parseInt(entry.Year);
  entry.Amount = entry.Amount.replace(/,/g, ''); // Remove commas.
  entry.Amount = parseFloat(entry.Amount);

  return entry;
}

// Clean transactions.
function cleanTransaction(entry) {
  entry.Amount = parseFloat(entry.Amount);

  return entry;
}

// Save to firebase.
function writeCategory(data) {
  database.ref('category/' + encodeURIComponent(data.Category)).set({
    Category: data.Category,
    'Parent Category': data['Parent Category'],
    Envelope : data.Envelope
  });
}

// Save to firebase.
function writeBudget(data) {
  database.ref('budget/' + encodeURIComponent(data.Category) + data.Month + data.Year).set({
    Category: data.Category,
    Month:    data.Month,
    Year:     data.Year,
    Amount:   data.Amount
  });
}

// Save to firebase.
function writeTransaction(data, reference) {
  var newTransactionRef = reference.push();

  newTransactionRef.set({
    Date: data.Date,
    Description:            data.Description,
    'Original Description': data['Original Description'],
    Amount:                 data.Amount,
    'Transaction Type':     data['Transaction Type'],
    Category:               data.Category,
    'Account Name':         data['Account Name'],
    Labels:                 data.Labels,
    Notes:                  data.Notes
  });
}

// Get all categories.
var getCategories = database.ref('category').once('value');
var getBudget = database.ref('budget').once('value');
var getTransactions = database.ref('transaction').once('value');