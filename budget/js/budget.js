var thisYear = 2017;

function renderBudgetTable() {

  var categories = budget.getCategoryList(thisYear),
      budgetRows = [];

  for (var i = 0; i < categories.length; i++) {

    budgetRows[i] = {};
    budgetRows[i].category = categories[i];
    budgetRows[i].total = 0;

    for (var month = 1; month <= 12; month++) {

      budgetRows[i]['month' + month] = budget.getCategory(categories[i], month, thisYear);
      budgetRows[i].total += budgetRows[i]['month' + month];

    }

  }

  for (var i = 0; i < budgetRows.length; i++) {

      var row = $('<tr></tr>');

      row.append('<td>' + budgetRows[i].category      + '</td>');
      row.append('<td>' + budgetRows[i].month1        + '</td>');
      row.append('<td>' + budgetRows[i].month2        + '</td>');
      row.append('<td>' + budgetRows[i].month3        + '</td>');
      row.append('<td>' + budgetRows[i].month4        + '</td>');
      row.append('<td>' + budgetRows[i].month5        + '</td>');
      row.append('<td>' + budgetRows[i].month6        + '</td>');
      row.append('<td>' + budgetRows[i].month7        + '</td>');
      row.append('<td>' + budgetRows[i].month8        + '</td>');
      row.append('<td>' + budgetRows[i].month9        + '</td>');
      row.append('<td>' + budgetRows[i].month10       + '</td>');
      row.append('<td>' + budgetRows[i].month11       + '</td>');
      row.append('<td>' + budgetRows[i].month12       + '</td>');
      row.append('<td class="totals">' + formatData(budgetRows[i].total) + '</td>');
      
      row.appendTo('#budget tbody');

  }

}

main.done(function() {
  renderBudgetTable();  
})
