var categoryLookup = {
  categories: [],

  getParent: function(category) {
    var parent = this.categories.find(function(element) {
      return element.Category == category && element['Parent Category'] != category;
    });
    
    result = parent ? parent['Parent Category'] : null;

    return result;
  },

  getChildren: function(category) {
    var result = [];
    var children = this.categories.filter(function(element) {
      return element['Parent Category'] == category && element.Category != category;
    })

    for (var i = 0; i < children.length ; i++) {
      result.push(children[i].Category);
    }

    return result;
  },

  getType: function(category) {
    var result = this.categories.find(function(element) {
      return element.Category == category;
    });

    if (result) {
      if (
        result.Category == 'Income' ||
        result['Parent Category'] == 'Income'
      ) {
        return 'Income';
      } else {
        return 'Expense';
      }
    } else {
      return null;
    }
  },

  isEnvelope: function(category) {
    var result = this.categories.find(function(element) {
      return element.Category == category;
    });

    if (result) {
      return result.Envelope;
    } else {
      return null;
    }
  }
};

var budget = {
  rows: [],

  // Convert months and years to integers and then remove commas and convert amounts to floats.
  cleanData: function() {
    for (var i = 0; i < this.rows.length; i++) {
      this.rows[i].Month  = parseInt(this.rows[i].Month);
      this.rows[i].Year   = parseInt(this.rows[i].Year);
      this.rows[i].Amount = this.rows[i].Amount.replace(/,/g, ''); // Remove commas.
      this.rows[i].Amount = parseFloat(this.rows[i].Amount);
    }
  },

  // Does the budget have any entries for this category?
  hasCategory: function(category, year) {
    var result = this.rows.filter(function(element) {
      return element.Category === category && element.Year === year
    });

    return result.length;
  },

  // Get the list of all categories in the budget for a given year.
  getCategoryList: function(year) {
    var result = this.rows.reduce(function(allCategories, element) {
      if (allCategories.indexOf(element.Category) > -1) {
        return allCategories;
      } else {
        if (element.Year === year) {
          allCategories.push(element.Category);
        }

        return allCategories;
      }
    }, []);

    return result;
  },

  // Get the budget amount for a category/month/year.
  getCategory: function(category, month, year) {
    var budgetAmount = this.rows.find(function(element) {
      return (
        element.Category  === category  &&
        element.Month     === month     &&
        element.Year      === year
      );
    });

    if (budgetAmount) {
      return budgetAmount.Amount;  
    } else {
      return 0;
    }
  },

  // Get the YTD budget for a category/month/year
  getCategoryYTD: function(category, month, year) {
    var budgetYTD = this.rows.reduce(function(sum, element) {
      if (
        element.Category  === category &&
        element.Month     <=  month    &&
        element.Year      === year
      ) {
        return sum + element.Amount;
      } else {
        return sum;
      }
    }, 0);

    return budgetYTD;
  }
}

var transactions = {
  rows: [],

  // Remove commas and convert amounts to floats.
  cleanData: function() {
    for (var i = 0; i < this.rows.length; i++) {
      // We are assuming that .Amount comes in as a float.
      // this.rows[i].Amount = this.rows[i].Amount.replace(/,/g, ''); // Remove commas.
      this.rows[i].Amount = parseFloat(this.rows[i].Amount);
    }
  },

  // Get all the categories associated with all transactions in a given year.
  getUniqueCategories: function(month, year) {
    // Reduce the transactions and sum the total for each category.

    var result = this.rows.reduce(function(allCategories, transaction) {
      var parsedDate = parseDate(transaction['Date']),
          thisMonth  = parsedDate.month,
          thisYear   = parsedDate.year;

      if (allCategories.indexOf(transaction.Category) > -1) {
        return allCategories;
      } else {
        if (thisYear === year && thisMonth === month) {
          allCategories.push(transaction.Category);
        }

        return allCategories;
      }
    }, []);

    return result;
  },

  getTransactionsInMonthYear: function(category, month, year) {
    var dataSet = this.rows.filter(function(transaction) {
      var parsedDate     = parseDate(transaction['Date']),
          thisMonth      = parsedDate.month,
          thisYear       = parsedDate.year,
          categoryFamily = [category];

      // Is the category a parent (top-level)?
      // If so, get all of its children, and when testing the categories below,
      // check to see if the transaction.Category equals the parent or any of its children.
      // If not, just proceed as normal.
      var parent = categoryLookup.getParent(category);
      if (parent) {
        // Do nothing
      } else {
        // The category is itself a parent.
        var children = categoryLookup.getChildren(category);
        categoryFamily = categoryFamily.concat(children); 
      }

      if (
        categoryFamily.indexOf(transaction.Category) > -1 &&
        thisMonth             == month &&
        thisYear              == year  &&
        transaction.Labels    !=  'Business Expenses' // TODO make this more flexible
      ) {
        return true;
      }
    });

    return dataSet;
  },

  getTransactionsYTD: function(category, month, year) {
    var dataSet = [];

    for (var i = 1; i <= month; i++) {
      dataSet = dataSet.concat(this.getTransactionsInMonthYear(category, i, year));
    }

    return dataSet;
  },

  // Get the sum of all Amount in a series of transactions.
  // Technically, doesn't need to be a method on this object.
  getSum: function(dataSet) {
    var sum = 0;

    $(dataSet).each(function(key, val) {

      var catType = categoryLookup.getType(val['Category']);

      if (val['Transaction Type'] == 'debit') {
        if (catType == 'Expense') {
          sum += val.Amount;
        } else if (catType == 'Income') {
          sum -= val.Amount;
        }
      } else {
        if (catType == 'Expense') {
          sum -= val.Amount;
        } else if (catType == 'Income') {
          sum += val.Amount;
        }
      }
      
    })

    return sum;
  },

  // Technically, doesn't need to be a method on this object.
  sort: function(dataSet, sortColumn) {
    var result = dataSet.sort(function(a, b) {
      first = a[sortColumn].toUpperCase();
      second = b[sortColumn].toUpperCase();
      
      if (first < second) {
        return -1;
      }

      if (first > second) {
        return 1;
      }

      // a must be equal to b
      return 0;
    });

    return result;
  }
}

var table = {

  filterToMonth: function(filters) {
    var budgetMonth       = 0,
        budgetYear        = 0,
        finalExpenses     = [],
        finalIncome       = [],
        finalNoBudget = [], // All categories which are not budgeted.
        finalEnvelope = []; // Envelope budgets.

    for (var key in filters) {
      if (filters[key].id == 'budget__month') {
        budgetMonth = parseInt(filters[key].val);
      }
      if (filters[key].id == 'budget__year') {
        budgetYear = parseInt(filters[key].val);
      }
    }

    // Get the list of all categories for this budget year.
    var categories = budget.getCategoryList(budgetYear);

    // For each category in the budget:
    for (var i = 0; i < categories.length; i++) {
      var theCategory = categories[i];

      // Get the budget for this month/year
      var catBudget = budget.getCategory(theCategory, budgetMonth, budgetYear);

      // Get the sum of all the transactions in this month/year
      var catActual = transactions.getTransactionsInMonthYear(theCategory, budgetMonth, budgetYear);
      catActual = transactions.getSum(catActual);

      // Get YTD budget up to this month/year
      var catBudgetYTD = budget.getCategoryYTD(theCategory, budgetMonth, budgetYear);

      // Get the YTD transactions in this month/year
      var catActualYTD = transactions.getTransactionsYTD(theCategory, budgetMonth, budgetYear);
      catActualYTD = transactions.getSum(catActualYTD);
      
      // Is this Income or Expense?
      var catType = categoryLookup.getType(theCategory);
      
      // Get the parent category.
      var catParent = categoryLookup.getParent(theCategory);
      catParent = (!catParent) ? theCategory : catParent;

      var theFullCategory = catParent + ': ' + theCategory;

      // If this is an envelope budget, do some further processing.
      var catEnvelope = categoryLookup.isEnvelope(theCategory);
      if (catEnvelope) {
        // Calculate the entire year budget
        var envBudget = budget.getCategoryYTD(theCategory, 12, budgetYear);

        // Calculate the amount spend YTD
        var envActualYTD = catActualYTD;

        // Calculat amount of envelope budget remaining.
        var envRemaining = envBudget - envActualYTD;

        // Calculate any overage
        var envOverage = 0;
        if (envActualYTD > envBudget) {
          envOverage = envBudget - envActualYTD;
        }

        // Reset actual and budget amounts for the Expenses table.
        catActual       = catBudget;
        catActualYTD    = catBudgetYTD;
        theFullCategory += ' (E)';

        // Push to the Envelope table.
        finalEnvelope.push({
          fullCategory: theFullCategory,
          category:     theCategory,
          YTD:          envActualYTD,
          budget:       envBudget,
          remaining:    envRemaining,
          overage:      envOverage
        });
      }

      // Calculate differences
      var catDiff = catBudget - catActual;
      var catDiffYTD = catBudgetYTD - catActualYTD;

      if (catType == 'Income') {
        // Add this data to finalIncome
        finalIncome.push({
          fullCategory:   theFullCategory,
          category:       theCategory,
          sum:            catActual,
          budget:         catBudget,
          difference:     -1 * catDiff,
          YTD:            catActualYTD,
          budgetYTD:      catBudgetYTD,
          differenceYTD:  -1 * catDiffYTD
        });
      } else if (catType == 'Expense') {
        // Add this data to finalExpenses
        finalExpenses.push({
          fullCategory:   theFullCategory,
          category:       theCategory,
          sum:            catActual,
          budget:         catBudget,
          difference:     catDiff,
          YTD:            catActualYTD,
          budgetYTD:      catBudgetYTD,
          differenceYTD:  catDiffYTD
        });        
      } else {
        // TODO - the category has no type
      }
    }

    // Get all the categories associated with transactions in this budget year.
    var allCategories = transactions.getUniqueCategories(budgetMonth, budgetYear);

    // Loop through all those categories and test to see if they have an entry in finalExpenses.
    for (var i = 0; i < allCategories.length; i++) {
      // Is this an expense or income category.
      var categoryType = categoryLookup.getType(allCategories[i]);

      if (categoryType == 'Income') {
        var thisCategory = finalIncome.findIndex(function(element) {
          return element.category === allCategories[i];
        })
      } else {
        var thisCategory = finalExpenses.findIndex(function(element) {
          return element.category === allCategories[i];
        })
      }

      if (thisCategory < 0) {
        // Check to see if each one has a parent category that is in the budget
        // If so, add to the parent category
        // Find the category's parent
        var catParent = categoryLookup.getParent(allCategories[i]);
        var catActual = transactions.getTransactionsInMonthYear(allCategories[i], budgetMonth, budgetYear);
        catActual = transactions.getSum(catActual);

        if (catParent) {
          if (categoryType == 'Income') {
            var parentIndex = finalIncome.findIndex(function(element) {
              return element.category === catParent;
            });
          } else {
            var parentIndex = finalExpenses.findIndex(function(element) {
              return element.category === catParent;
            });
          }

          // If a record exists already for the parent, then do nothing
          if (parentIndex >= 0) {
            // Do nothing
          } else {
            // This is a category with a parent that is not in the budget.
            // Add it to the No Budget table
            finalNoBudget.push({
              fullCategory: catParent + ': ' + allCategories[i],
              category:     allCategories[i],
              sum:          catActual
            });
          }          
        } else {
          // This is a category with no parent that is not in the budget.
          // Put it in the "No Budget" table.
          finalNoBudget.push({
            fullCategory: allCategories[i] + ': ' + allCategories[i],
            category:     allCategories[i],
            sum:          catActual
          });
        }
      }
    }

    // Sort and then render.
    finalExpenses = transactions.sort(finalExpenses, 'fullCategory');
    finalIncome   = transactions.sort(finalIncome, 'fullCategory');
    finalEnvelope = transactions.sort(finalEnvelope, 'fullCategory');

    this.renderBudgetTable(finalExpenses, budgetMonth, budgetYear, 'expenses');
    this.renderBudgetTable(finalIncome, budgetMonth, budgetYear, 'income');
    this.renderEnvelopeTable(finalEnvelope, budgetMonth, budgetYear);
    this.renderNoBudgetTable(finalNoBudget, budgetMonth, budgetYear);

    // Calculate income vs expense
    // TODO come up with a better way to get these values
    var expensesDiff  = parseFloat($('#expenses .totals td:nth-child(4)').text());
    var incomeDiff    = parseFloat($('#income .totals td:nth-child(4)').text());
    var totalDiff     = incomeDiff + expensesDiff;
    
    var expensesDiffYTD  = parseFloat($('#expenses .totals td:nth-child(7)').text());
    var incomeDiffYTD    = parseFloat($('#income .totals td:nth-child(7)').text());
    var totalOverage     = parseFloat($('#envelope .totals td:last-child').text());
    var totalDiffYTD     = incomeDiffYTD + expensesDiffYTD + totalOverage;

    // Clear the over-under table.
    $('#over-under tbody').html('');

    // Append the over-under total for this month.
    var row = $('<tr class="totals"></tr>');
    row.append('<td>Over/under this month</td>');
    row.append('<td>' + formatData(totalDiff) + '</td>');
    row.appendTo('#over-under tbody');

    // Append the over-under total YTD.
    row = $('<tr class="totals"></tr>');
    row.append('<td>Over/under year-to-date</td>');
    row.append('<td>' + formatData(totalDiffYTD) + '</td>');
    row.appendTo('#over-under tbody');
  },

  filterTo: function(filters) {
    var filterSet = [];
    var total = 0;

    if (filters.YTD == 'ytd') {
      filterSet = transactions.getTransactionsYTD(filters.Category, filters.Month, filters.Year);
    } else {
      filterSet = transactions.getTransactionsInMonthYear(filters.Category, filters.Month, filters.Year);
    }

    filterSet = transactions.sort(filterSet, 'Date');
    total = transactions.getSum(filterSet);

    this.renderTransactions(filterSet, total);

    $('#transactionsModal').modal();
  },

  renderTransactions: function(dataSet, total) {
    $('#transactions tbody').html('');

    $(dataSet).each(function(key, val) {
      var row = $('<tr></tr>');
      for (var dataKey in val) {
        if (
          dataKey == 'Original Description' ||
          dataKey == 'Labels' ||
          dataKey == 'Account Name'
        ) {
          continue;
        }
        row.append("<td>" + val[dataKey] + "</td>");
      }
      
      row.appendTo('#transactions tbody');
    })

    var total = $('<tr class="totals"><td>TOTAL:</td><td colspan="7">' + total + '</td></tr>');
    total.appendTo('#transactions tbody');

    return;
  },

  renderBudgetTable: function(dataSet, month, year, type) {
    var total = {
      budget:         0,
      actual:         0,
      difference:     0,
      YTD:            0,
      budgetYTD:      0,
      differenceYTD:  0
    };

    $('#' + type + ' tbody').html('')

    for (var i = 0; i < dataSet.length; i++) {
      var category        = dataSet[i].category,
          fullCategory    = dataSet[i].fullCategory,
          budget          = dataSet[i].budget,
          actual          = dataSet[i].sum,
          difference      = dataSet[i].difference,
          YTD             = dataSet[i].YTD,
          budgetYTD       = dataSet[i].budgetYTD,
          differenceYTD   = dataSet[i].differenceYTD;

      categoryLink = buildCategoryLink(category, fullCategory, month, year);

      total.budget        += budget;
      total.actual        += actual;
      total.difference    += difference;
      total.YTD           += YTD;
      total.budgetYTD     += budgetYTD;
      total.differenceYTD += differenceYTD;

      var row = $('<tr></tr>');
      row.append('<td>' + categoryLink      + '</td>');
      row.append('<td>' + formatData(budget)        + '</td>');
      row.append('<td>' + formatData(actual)        + '</td>');
      row.append('<td>' + formatData(difference)    + '</td>');
      row.append('<td>' + formatData(budgetYTD)     + '</td>');
      row.append('<td>' + formatData(YTD)           + '</td>');
      row.append('<td>' + formatData(differenceYTD) + '</td>');
      
      row.appendTo('#' + type + ' tbody');
    }

    totals = $('<tr class="totals"></tr>');
    totals.append('<td>TOTAL</td>');
    totals.append('<td>' + formatData(total.budget)        + '</td>');
    totals.append('<td>' + formatData(total.actual)        + '</td>');
    totals.append('<td>' + formatData(total.difference)    + '</td>');
    totals.append('<td>' + formatData(total.budgetYTD)     + '</td>');
    totals.append('<td>' + formatData(total.YTD)           + '</td>');
    totals.append('<td>' + formatData(total.differenceYTD) + '</td>');

    totals.appendTo('#' + type + ' tbody');
  },

  renderEnvelopeTable: function(dataSet, month, year) {
    var total = {
      budget:    0,
      YTD:       0,
      remaining: 0,
      overage:   0
    }

    $('#envelope tbody').html('');

    for (var i = 0; i < dataSet.length; i++) {
      var category      = dataSet[i].category,
          fullCategory  = dataSet[i].fullCategory,
          budget        = dataSet[i].budget,
          YTD           = dataSet[i].YTD,
          remaining     = dataSet[i].remaining,
          overage       = dataSet[i].overage;

      categoryLink = buildCategoryLink(category, fullCategory, month, year);

      total.budget    += budget;
      total.YTD       += YTD;
      total.remaining += remaining;
      total.overage   += overage;

      var row = $('<tr></tr>');
      row.append('<td>' + categoryLink + '</td>');
      row.append('<td>' + formatData(budget) + '</td>');
      row.append('<td>' + formatData(YTD) + '</td>');
      row.append('<td>' + formatData(remaining) + '</td>')
      row.append('<td>' + formatData(overage) + '</td>');

      row.appendTo('#envelope tbody');
    }

    totals = $('<tr class="totals"></tr>');
    totals.append('<td>TOTAL</td>');
    totals.append('<td>' + formatData(total.budget)  + '</td>');
    totals.append('<td>' + formatData(total.YTD)     + '</td>');
    totals.append('<td>' + formatData(total.remaining)     + '</td>');
    totals.append('<td>' + formatData(total.overage) + '</td>');

    totals.appendTo('#envelope tbody');
  },

  renderNoBudgetTable: function(dataSet, month, year) {
    $('#nobudget tbody').html('');

    for (var i = 0; i < dataSet.length; i++) {
      var category = dataSet[i].category;
      var fullCategory = dataSet[i].fullCategory;
      var actual = roundTwoDigits(dataSet[i].sum);

      categoryLink = buildCategoryLink(category, fullCategory, month, year);

      var row = $('<tr></tr>');
      row.append('<td>' + categoryLink  + '</td>');
      row.append('<td>' + actual        + '</td>');
      
      row.appendTo('#nobudget tbody');
    }
  }
};

function buildCategoryLink(category, fullCategory, month, year) {
  var url = '/transactions/' + cleanMe(category) + '/' + month + '/' + year;
  var urlYTD = url + '/ytd';
  return '<a data-category="' + category + '" href="' + url + '" class="category-link">' + fullCategory + '</a> <a data-category="' + category + '" href="' + urlYTD + '" class="category-link">(YTD)</a>';
}

function cleanMe(aString) {
  return aString.toLowerCase().replace(/ /g,'');
}

// Given an object of objects, convert it to an array of objects.
function convertObjToArray(obj) {
  // Convert the object to an array.
  var objArray = [];

  for (var key in obj) {
    // Skip the loop if the property is from prototype.
    if (!obj.hasOwnProperty(key)) continue;

    objArray.push(obj[key]);
  }

  return objArray;
}


function roundTwoDigits(aNumber) {
  return new Number(aNumber).toFixed(2);
}

function formatData(aNumber) {
  if (aNumber < 0) {
    return '<span class="negative">' + roundTwoDigits(aNumber) + '</span>'
  } else {
    return '<span class="positive">' + roundTwoDigits(aNumber) + '</span>'
  }
}

function getFilters($form) {
  var filters = [];

  $form.find('select').each(function() {
    var id = $(this).attr('id');
    var val = $(this).val();
    var column = $(this).data('filter-column')

    filters.push( {id: id, val: val, column: column} );
  })

  return filters;
}

function parseDate(dateString) {
  var month = dateString.split('/')[0],
      year = dateString.split('/')[2];

  var result = {
    month: parseInt(month),
    year:  parseInt(year)
  }

  return result;
}

function showError(error) {
  var errorString = '<div class="alert">' + error + '</div>';
  $('body').prepend(errorString);
}



// This is where everything really begins.
//-----------------------------------------------------------------------------
function init() {

  $('body').on('click', '.category-link', function(e) {
    e.preventDefault();

    var pathComponents = e.currentTarget.pathname.split('/');
    var filters = {};

    filters.Category  = $(this).data('category');
    filters.Month     = parseInt(pathComponents[3]);
    filters.Year      = parseInt(pathComponents[4]);
    filters.YTD       = pathComponents[5];

    table.filterTo(filters);
  });

  $('#budget__filter button').on('click', function() {
    table.filterToMonth(getFilters($(this).closest('form')), budget.responseJSON);
  });

}

// Don't do anything until the budget and all transactions have been fetched.
//-----------------------------------------------------------------------------
getCategories.then(function(snapshotC) {
  // Convert the object to an array.
  var dataC = snapshotC.val();
  dataC = convertObjToArray(dataC);

  // Assign the array to the lookup object.
  categoryLookup.categories = dataC;


  getBudget.then(function(snapshotB) {
    // Convert the object to an array.
    var dataB = snapshotB.val();
    dataB = convertObjToArray(dataB);

    // Assign the array to the lookup object.
    budget.rows = dataB;


    getTransactions.then(function(snapshotT) {
      // Convert the object to an array.
      var dataT = snapshotT.val();
      dataT = convertObjToArray(dataT);

      // Assign the array to the lookup object.
      transactions.rows = dataT;

      // Kick everything off.
      init();
    });
  });
});