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


firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    // Don't do anything until the budget and all transactions have been fetched.
    //-----------------------------------------------------------------------------
    budgetApp.getCategories.then(function(snapshotC) {

      // Assign the snapshot to the categoryLookup object.
      categoryLookup.assignRows(snapshotC.val());

      budgetApp.getBudget.then(function(snapshotB) {

        // Assign the snapshot to the budget object.
        budget.assignRows(snapshotB.val());

        budgetApp.getTransactions.then(function(snapshotT) {

          // Assign the array to the transactions object.
          transactions.assignRows(snapshotT.val());

          // Kick everything off.
          init();
        });
      });
    });
  }
});


