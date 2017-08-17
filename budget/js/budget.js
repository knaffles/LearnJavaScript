var thisYear = 2017;

function renderBudgetTable(dataSet, tableId, totals) {

  // Clear the table.
  $('#' + tableId + ' tbody').html('');

  for (var i = 0; i < dataSet.length; i++) {

      var row = $('<tr></tr>');

      row.append('<td>' + dataSet[i].displayCategory + '</td>');

      for (var month = 1; month <= 12; month++) {
        row.append(renderBudgetCell(dataSet[i], month));  
      }

      row.append('<td class="totals">' + formatData(dataSet[i].total) + '</td>');
      
      row.appendTo('#' + tableId + ' tbody');

  }

  // Render totals
  var row = $('<tr class="totals"></tr>');

  row.append('<td>&nbsp;</td>');

  for (var month = 1; month <= 12; month++) {
    row.append('<td>' + formatData(totals['month' + month])   + '</td>');
  }

  row.append('<td class="totals">' + formatData(totals.total) + '</td>');
  
  row.appendTo('#' + tableId + ' tbody');

}


function renderDiffTable(dataSet, tableId) {

  // Clear the table
  $('#' + tableId + ' tbody').html('');

  var row = $('<tr></tr>');

  row.append('<td>&nbsp;</td>');

  for (var month = 1; month <= 12; month++) {
    row.append('<td>' + formatData(dataSet['month' + month])   + '</td>');
  }

  row.append('<td class="totals">' + formatData(dataSet.yearTotal) + '</td>');
  
  row.appendTo('#' + tableId + ' tbody');

}


function buildBudgetData() {

  var categories      = budget.getCategoryList(thisYear),
      budgetExpenses  = [],
      budgetIncome    = [],
      budgetDiff      = [],
      totalExpenses   = {},
      totalIncome     = {};

  // Initialize totals
  for (var month = 1; month <= 12; month++) {
    totalExpenses['month' + month] = totalIncome['month' + month] = 0;
  }
  totalExpenses.total = totalIncome.total = 0;

  for (var i = 0; i < categories.length; i++) {

    var entry = {};

    // Get the parent.
    var catParent = categoryLookup.getParent(categories[i]);
    catParent = (!catParent) ? categories[i] : catParent;

    // Income or expense?
    var catType = categoryLookup.getType(categories[i]);

    entry.category        = categories[i];
    entry.total           = 0;
    entry.displayCategory = catParent + ': ' + categories[i];
    entry.nodeId          = categories[i].nodeId;
    
    for (var month = 1; month <= 12; month++) {
      // Get the nodeId
      var nodeId = budget.getNodeId(categories[i], month, thisYear);

      entry['month' + month] = budget.getCategory(categories[i], month, thisYear);
      entry.total += entry['month' + month];
      entry['nodeId' + month] = nodeId;

      if (catType == 'Income') {
        totalIncome['month' + month] += entry['month' + month];
      } else if (catType == 'Expense') {
        totalExpenses['month' + month] += entry['month' + month];
      }
    }

    if (catType == 'Income') {
      budgetIncome.push(entry);
    } else if (catType == 'Expense') {
      budgetExpenses.push(entry);
    }
  }

  // Calculate totals for entire year.
  for (var month = 1; month <= 12; month++) {
    totalExpenses.total += totalExpenses['month' + month];
    totalIncome.total += totalIncome['month' + month];
  }

  budgetExpenses = transactions.sort(budgetExpenses, 'displayCategory');
  budgetIncome   = transactions.sort(budgetIncome, 'displayCategory');

  renderBudgetTable(budgetExpenses, 'expenses', totalExpenses);
  renderBudgetTable(budgetIncome, 'income', totalIncome);

  // Calculate Income - Expenses
  for (var month = 1; month <= 12; month++) {
    budgetDiff['month' + month] = totalIncome['month' + month] - totalExpenses['month' + month];
  }

  budgetDiff.yearTotal = totalIncome.total - totalExpenses.total;
  renderDiffTable(budgetDiff, 'income-expenses');

}


// Render a budget table cell.
function renderBudgetCell(data, month) {
  var amount = formatData(data['month' + month]);
  var nodeId = data['nodeId' + month];

  return '<td class="budget-cell" data-node-id="' + nodeId + '" data-month="' + month + '">' + amount + '</td>';
}


// Set a listener on the budget data so that we can referesh the table
// when the data changes.
firebase.auth().onAuthStateChanged(function(user) {

  if (user) {

    var uid = user.uid;

    var masquerade = sessionStorage.getItem('masquerade');
    if (masquerade) {
      uid = masquerade;
    }

    var budgetData = database.ref('budget/' + uid);
    var categoryData = database.ref('category/' + uid);

    categoryData.on('value', function(snapshotC) {

      // Assign the snapshot to the categoryLookup object.
      categoryLookup.assignRows(snapshotC.val());

      budgetData.on('value', function(snapshotB) {

        // Assign the snapshot to the categoryLookup object.
        budget.assignRows(snapshotB.val());
        buildBudgetData();

      });

      $('#expenses').on('click', '.budget-cell', function() {
        $('#budget-amount').val($(this).text());
        $('#budget-amount').data('node-id', $(this).data('node-id'));
        $('#budget-modal').modal();
        $('#budget-amount').focus();
        $('#budget-amount')[0].select();
      });

      $('#budget-save').on('click', function(e) {
        e.preventDefault();

        // Get the node ID to update.
        var nodeId = $('#budget-amount').data('node-id');

        // Get the updated value.
        var newAmount = parseFloat($('#budget-amount').val());

        // Write to firebase.
        var nodeRef = database.ref('budget/' + uid + '/' + nodeId);
        nodeRef.update({ Amount: newAmount });

        // Dismiss the modal.
        $('#budget-modal').modal('toggle');
      })

    })

  }

});


