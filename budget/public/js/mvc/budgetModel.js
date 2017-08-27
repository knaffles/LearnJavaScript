var BudgetModel = function (transactionsModel) {

  this.rows = [];
  this.categories = [],
  this.budgetExpenses = [];
  this.budgetIncome = [];
  this.budgetDiff = [];
  this.totalExpenses = {};
  this.totalIncome = {};
  this.transactionsModel = transactionsModel;
  this.dataBuiltEvent = new Event(this);

};

BudgetModel.prototype = {

  // Given a firebase snapshot, assign to the rows property.
  assignRows: function(snapshot) {
    // Convert the object to an array.
    snapshot = convertObjToArray(snapshot);

    // Assign the array to the lookup object.
    this.rows = snapshot;

    this.categories = this.getCategoryList(thisYear);
  },

  buildBudgetData: function() {
    // Set everything to empty.
    this.budgetExpenses = [];
    this.budgetIncome = [];
    this.budgetDiff = [];
    this.totalExpenses = [];
    this.totalIncome = [];

    // Initialize totals
    for (var month = 1; month <= 12; month++) {
      this.totalExpenses['month' + month] = this.totalIncome['month' + month] = 0;
    }
    this.totalExpenses.total = this.totalIncome.total = 0;

    for (var i = 0; i < this.categories.length; i++) {

      var entry = {};

      // Get the parent.
      var catParent = categoryLookup.getParent(this.categories[i]);
      catParent = (!catParent) ? this.categories[i] : catParent;

      // Income or expense?
      var catType = categoryLookup.getType(this.categories[i]);

      entry.category        = this.categories[i];
      entry.total           = 0;
      entry.displayCategory = catParent + ': ' + this.categories[i];
      entry.nodeId          = this.categories[i].nodeId;
      
      for (var month = 1; month <= 12; month++) {
        // Get the nodeId
        var nodeId = this.getNodeId(this.categories[i], month, thisYear);

        entry['month' + month] = this.getCategory(this.categories[i], month, thisYear);
        entry.total += entry['month' + month];
        entry['nodeId' + month] = nodeId;

        if (catType == 'Income') {
          this.totalIncome['month' + month] += entry['month' + month];
        } else if (catType == 'Expense') {
          this.totalExpenses['month' + month] += entry['month' + month];
        }
      }

      if (catType == 'Income') {
        this.budgetIncome.push(entry);
      } else if (catType == 'Expense') {
        this.budgetExpenses.push(entry);
      }
    }

    // Calculate totals for entire year.
    for (var month = 1; month <= 12; month++) {
      this.totalExpenses.total += this.totalExpenses['month' + month];
      this.totalIncome.total += this.totalIncome['month' + month];
    }

    this.budgetExpenses = this.transactionsModel.sort(this.budgetExpenses, 'displayCategory');
    this.budgetIncome   = this.transactionsModel.sort(this.budgetIncome, 'displayCategory');

    // Calculate Income - Expenses
    for (var month = 1; month <= 12; month++) {
      this.budgetDiff['month' + month] = this.totalIncome['month' + month] - this.totalExpenses['month' + month];
    }

    this.budgetDiff.yearTotal = this.totalIncome.total - this.totalExpenses.total;

    this.dataBuiltEvent.notify();
  },

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
  },

  getNodeId: function(category, month, year) {
    var nodeId = this.rows.find(function(element) {
      return (
        element.Category  === category  &&
        element.Month     === month     &&
        element.Year      === year
      );
    });

    if (nodeId) {
      return nodeId.nodeId;
    } else {
      return null;
    }
  }


 // addTask: function (task) {
 //     this.tasks.push({
 //         taskName: task,
 //         taskStatus: 'uncompleted'
 //     });
 //     this.addTaskEvent.notify();
 // },

 // getTasks: function () {
 //     return this.tasks;
 // },

 // setSelectedTask: function (taskIndex) {
 //     this.selectedTasks.push(taskIndex);
 // },

 // unselectTask: function (taskIndex) {
 //     this.selectedTasks.splice(taskIndex, 1);
 // },

 // setTasksAsCompleted: function () {
 //     var selectedTasks = this.selectedTasks;
 //     for (var index in selectedTasks) {
 //         this.tasks[selectedTasks[index]].taskStatus = 'completed';
 //     }

 //     this.setTasksAsCompletedEvent.notify();

 //     this.selectedTasks = [];

 // },


 // deleteTasks: function () {
 //     var selectedTasks = this.selectedTasks.sort();

 //     for (var i = selectedTasks.length - 1; i >= 0; i--) {
 //         this.tasks.splice(this.selectedTasks[i], 1);
 //     }

 //     // clear the selected tasks
 //     this.selectedTasks = [];

 //     this.deleteTasksEvent.notify();

 // }


 };