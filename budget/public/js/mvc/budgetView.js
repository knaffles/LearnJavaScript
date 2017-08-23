var BudgetView = function (model) {

  this.model = model;
  // this.addTaskEvent = new Event(this);
  // this.selectTaskEvent = new Event(this);
  // this.unselectTaskEvent = new Event(this);
  // this.completeTaskEvent = new Event(this);
  // this.deleteTaskEvent = new Event(this);

  this.init();

};

BudgetView.prototype = {

  init: function () {
    this.createChildren()
        .setupHandlers()
        .enable();
  },

  createChildren: function () {
    // Cache the document object
    this.$content = $('#content');
    this.$expenses = this.$content.find('#expenses');
    // this.$addTaskButton = this.$container.find('.js-add-task-button');
    // this.$taskTextBox = this.$container.find('.js-task-textbox');
    // this.$tasksContainer = this.$container.find('.js-tasks-container');

    return this;
  },

  setupHandlers: function () {
    this.expensesClickHandler = this.expensesClick.bind(this);
    // this.addTaskButtonHandler = this.addTaskButton.bind(this);
    // this.selectOrUnselectTaskHandler = this.selectOrUnselectTask.bind(this);
    // this.completeTaskButtonHandler = this.completeTaskButton.bind(this);
    // this.deleteTaskButtonHandler = this.deleteTaskButton.bind(this);

    /**
    Handlers from Event Dispatcher
    */
    // this.addTaskHandler = this.addTask.bind(this);
    // this.clearTaskTextBoxHandler = this.clearTaskTextBox.bind(this);
    // this.setTasksAsCompletedHandler = this.setTasksAsCompleted.bind(this);
    // this.deleteTasksHandler = this.deleteTasks.bind(this);

    this.dataBuiltHandler = this.dataBuilt.bind(this);

    return this;
  },

  enable: function () {
    this.$expenses.on('click', '.budget-cell', this.expensesClickHandler);
    // this.$addTaskButton.click(this.addTaskButtonHandler);
    // this.$container.on('click', '.js-task', this.selectOrUnselectTaskHandler);
    // this.$container.on('click', '.js-complete-task-button', this.completeTaskButtonHandler);
    // this.$container.on('click', '.js-delete-task-button', this.deleteTaskButtonHandler);

    /**
     * Event Dispatcher
     */
    // this.model.addTaskEvent.attach(this.addTaskHandler);
    // this.model.addTaskEvent.attach(this.clearTaskTextBoxHandler);
    // this.model.setTasksAsCompletedEvent.attach(this.setTasksAsCompletedHandler);
    // this.model.deleteTasksEvent.attach(this.deleteTasksHandler);

    this.model.dataBuiltEvent.attach(this.dataBuiltHandler);

    return this;
  },

  expensesClick: function() {
    debugger;
    $('#budget-amount').val($(event.target).text());
    $('#budget-amount').data('node-id', $(event.target).data('node-id'));
    $('#budget-modal').modal();
    $('#budget-amount').focus();
    $('#budget-amount')[0].select();
  },

  // addTaskButton: function () {
  //     this.addTaskEvent.notify({
  //         task: this.$taskTextBox.val()
  //     });
  // },

  // completeTaskButton: function () {
  //     this.completeTaskEvent.notify();
  // },

  // deleteTaskButton: function () {
  //     this.deleteTaskEvent.notify();
  // },

  // selectOrUnselectTask: function () {

  //     var taskIndex = $(event.target).attr("data-index");

  //     if ($(event.target).attr('data-task-selected') == 'false') {
  //         $(event.target).attr('data-task-selected', true);
  //         this.selectTaskEvent.notify({
  //             taskIndex: taskIndex
  //         });
  //     } else {
  //         $(event.target).attr('data-task-selected', false);
  //         this.unselectTaskEvent.notify({
  //             taskIndex: taskIndex
  //         });
  //     }

  // },

  show: function () {
    this.renderBudgetTable(this.model.budgetExpenses, 'expenses', this.model.totalExpenses);
    this.renderBudgetTable(this.model.budgetIncome, 'income', this.model.totalIncome);
    this.renderDiffTable(this.model.budgetDiff, 'income-expenses');
  },

  renderBudgetTable: function(dataSet, tableId, totals) {
    // Clear the table.
    $('#' + tableId + ' tbody').html('');

    for (var i = 0; i < dataSet.length; i++) {
      var row = $('<tr></tr>');

      row.append('<td>' + dataSet[i].displayCategory + '</td>');

      for (var month = 1; month <= 12; month++) {
        row.append(this.renderBudgetCell(dataSet[i], month));  
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
  },

  renderDiffTable: function(dataSet, tableId) {
    // Clear the table
    $('#' + tableId + ' tbody').html('');

    var row = $('<tr></tr>');

    row.append('<td>&nbsp;</td>');

    for (var month = 1; month <= 12; month++) {
      row.append('<td>' + formatData(dataSet['month' + month])   + '</td>');
    }

    row.append('<td class="totals">' + formatData(dataSet.yearTotal) + '</td>');
    
    row.appendTo('#' + tableId + ' tbody');
  },

  // Render a budget table cell.
  renderBudgetCell: function(data, month) {
    var amount = formatData(data['month' + month]);
    var nodeId = data['nodeId' + month];

    return '<td class="budget-cell" data-node-id="' + nodeId + '" data-month="' + month + '">' + amount + '</td>';
  },

  /* -------------------- Handlers From Event Dispatcher ----------------- */

  // clearTaskTextBox: function () {
  //     this.$taskTextBox.val('');
  // },

  // addTask: function () {
  //     this.show();
  // },

  // setTasksAsCompleted: function () {
  //     this.show();

  // },

  // deleteTasks: function () {
  //     this.show();

  // }

  dataBuilt: function() {
    this.show();
  }

  /* -------------------- End Handlers From Event Dispatcher ----------------- */


};