var ExpensesController = function (budgetModel, transactionsModel, transactionsView, uid) {

  this.budgetModel = budgetModel;
  this.transactionsModel = transactionsModel;
  this.transactionsView = transactionsView;
  this.uid = uid;

  this.init();

};

ExpensesController.prototype = {

  init: function () {
    this.createChildren()
        .setupHandlers()
        .enable();
  },

  createChildren: function () {
    // no need to create children inside the controller
    // this is a job for the view
    // you could all as well leave this function out
    return this;
  },

  setupHandlers: function () {
    // this.addTaskHandler = this.addTask.bind(this);
    
    return this;
  },

  enable: function () {
    // this.view.addTaskEvent.attach(this.addTaskHandler);

    var _this = this;

    // Get all categories.
    var getCategories = database.ref('category/' + this.uid).once('value');
    var getBudget = database.ref('budget/' + this.uid).once('value');
    var getTransactions = database.ref('transaction/' + this.uid).once('value');

    // Don't do anything until the budget and all transactions have been fetched.
    //-----------------------------------------------------------------------------
    getCategories.then(function(snapshotC) {

      // Assign the snapshot to the categoryLookup object.
      categoryLookup.assignRows(snapshotC.val());

      getBudget.then(function(snapshotB) {

        // Assign the snapshot to the budget object.
        _this.budgetModel.assignRows(snapshotB.val());

        getTransactions.then(function(snapshotT) {

          // Assign the array to the transactions object.
          _this.transactionsModel.assignRows(snapshotT.val());

          // Kick everything off.
          $('body').on('click', '.category-link', function(e) {
            e.preventDefault();

            var pathComponents = e.currentTarget.pathname.split('/');
            var filters = {};

            filters.Category  = $(this).data('category');
            filters.Month     = parseInt(pathComponents[3]);
            filters.Year      = parseInt(pathComponents[4]);
            filters.YTD       = pathComponents[5];

            _this.transactionsView.filterTo(filters);
          });

          $('#budget__filter button').on('click', function() {
            _this.transactionsView.filterToMonth(getFilters($(this).closest('form')));
          });

        });
      });
    });

    return this;
  }

};