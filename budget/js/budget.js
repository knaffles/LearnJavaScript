var thisYear = 2017;

function renderBudgetTable(dataSet, tableId, totals) {

  // Clear the table.
  $('#' + tableId + ' tbody').html('');

  for (var i = 0; i < dataSet.length; i++) {

      var row = $('<tr></tr>');

      row.append('<td>' + dataSet[i].displayCategory + '</td>');
      row.append('<td>' + formatData(dataSet[i].month1)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month2)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month3)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month4)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month5)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month6)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month7)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month8)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month9)   + '</td>');
      row.append('<td>' + formatData(dataSet[i].month10)  + '</td>');
      row.append('<td>' + formatData(dataSet[i].month11)  + '</td>');
      row.append('<td>' + formatData(dataSet[i].month12)  + '</td>');
      row.append('<td class="totals">' + formatData(dataSet[i].total) + '</td>');
      
      row.appendTo('#' + tableId + ' tbody');

  }

  // Render totals
  var row = $('<tr class="totals"></tr>');

  row.append('<td>&nbsp;</td>');
  row.append('<td>' + formatData(totals.month1)   + '</td>');
  row.append('<td>' + formatData(totals.month2)   + '</td>');
  row.append('<td>' + formatData(totals.month3)   + '</td>');
  row.append('<td>' + formatData(totals.month4)   + '</td>');
  row.append('<td>' + formatData(totals.month5)   + '</td>');
  row.append('<td>' + formatData(totals.month6)   + '</td>');
  row.append('<td>' + formatData(totals.month7)   + '</td>');
  row.append('<td>' + formatData(totals.month8)   + '</td>');
  row.append('<td>' + formatData(totals.month9)   + '</td>');
  row.append('<td>' + formatData(totals.month10)  + '</td>');
  row.append('<td>' + formatData(totals.month11)  + '</td>');
  row.append('<td>' + formatData(totals.month12)  + '</td>');
  row.append('<td class="totals">' + formatData(totals.total) + '</td>');
  
  row.appendTo('#' + tableId + ' tbody');

}


function renderDiffTable(dataSet, tableId) {

  // Clear the table
  $('#' + tableId + ' tbody').html('');

  var row = $('<tr></tr>');

  row.append('<td>&nbsp;</td>');
  row.append('<td>' + formatData(dataSet.month1)   + '</td>');
  row.append('<td>' + formatData(dataSet.month2)   + '</td>');
  row.append('<td>' + formatData(dataSet.month3)   + '</td>');
  row.append('<td>' + formatData(dataSet.month4)   + '</td>');
  row.append('<td>' + formatData(dataSet.month5)   + '</td>');
  row.append('<td>' + formatData(dataSet.month6)   + '</td>');
  row.append('<td>' + formatData(dataSet.month7)   + '</td>');
  row.append('<td>' + formatData(dataSet.month8)   + '</td>');
  row.append('<td>' + formatData(dataSet.month9)   + '</td>');
  row.append('<td>' + formatData(dataSet.month10)  + '</td>');
  row.append('<td>' + formatData(dataSet.month11)  + '</td>');
  row.append('<td>' + formatData(dataSet.month12)  + '</td>');
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
  totalExpenses.month1 = totalIncome.month1 = 0;
  totalExpenses.month2 = totalIncome.month2 = 0;
  totalExpenses.month3 = totalIncome.month3 = 0;
  totalExpenses.month4 = totalIncome.month4 = 0;
  totalExpenses.month5 = totalIncome.month5 = 0;
  totalExpenses.month6 = totalIncome.month6 = 0;
  totalExpenses.month7 = totalIncome.month7 = 0;
  totalExpenses.month8 = totalIncome.month8 = 0;
  totalExpenses.month9 = totalIncome.month9 = 0;
  totalExpenses.month10 = totalIncome.month10 = 0;
  totalExpenses.month11 = totalIncome.month11 = 0;
  totalExpenses.month12 = totalIncome.month12 = 0;
  totalExpenses.total = totalIncome.total = 0;

  for (var i = 0; i < categories.length; i++) {

    var entry = {};

    // Get the parent.
    var catParent = categoryLookup.getParent(categories[i]);
    catParent = (!catParent) ? categories[i] : catParent;

    // Income or expense?
    var catType = categoryLookup.getType(categories[i]);

    entry.category        = categories[i],
    entry.total           = 0;
    entry.displayCategory = catParent + ': ' + categories[i];
    
    for (var month = 1; month <= 12; month++) {

      entry['month' + month] = budget.getCategory(categories[i], month, thisYear);
      entry.total += entry['month' + month];

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
  budgetIncome = transactions.sort(budgetIncome, 'displayCategory');

  renderBudgetTable(budgetExpenses, 'expenses', totalExpenses);
  renderBudgetTable(budgetIncome, 'income', totalIncome);

  // Calculate Income - Expenses
  for (var month = 1; month <= 12; month++) {

    budgetDiff['month' + month] = totalIncome['month' + month] - totalExpenses['month' + month];

  }

  budgetDiff.yearTotal = totalIncome.total - totalExpenses.total;
  renderDiffTable(budgetDiff, 'income-expenses');

}


// Set a listener on the budget data so that we can referesh the table
// when the data changes.
var budgetData = database.ref('budget');
var categoryData = database.ref('category');

categoryData.on('value', function(snapshotC) {

  // Assign the snapshot to the categoryLookup object.
  categoryLookup.assignRows(snapshotC.val());

  budgetData.on('value', function(snapshotB) {
    console.log('changed!');
    // Assign the snapshot to the categoryLookup object.
    budget.assignRows(snapshotB.val());
    buildBudgetData();
  });


})
