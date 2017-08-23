var BudgetView = function (model, uid) {

  this.model = model;
  this.uid = uid;
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
    this.$budgetSave = this.$content.find('#budget-save');

    return this;
  },

  setupHandlers: function () {
    this.saveClickHandler = this.saveClick.bind(this);

    /**
    Handlers from Event Dispatcher
    */
    this.dataBuiltHandler = this.dataBuilt.bind(this);

    return this;
  },

  enable: function () {
    this.$expenses.on('click', '.budget-cell', function() {
      $('#budget-amount').val($(this).text());
      $('#budget-amount').data('node-id', $(this).data('node-id'));
      $('#budget-modal').modal();
      $('#budget-amount').focus();
      $('#budget-amount')[0].select();
    });
    this.$budgetSave.on('click', this.saveClickHandler);

    /**
     * Event Dispatcher
     */
    this.model.dataBuiltEvent.attach(this.dataBuiltHandler);

    return this;
  },

  saveClick: function() {
    event.preventDefault();

    // Get the node ID to update.
    var nodeId = $('#budget-amount').data('node-id');

    // Get the updated value.
    var newAmount = parseFloat($('#budget-amount').val());

    // Write to firebase.
    var nodeRef = database.ref('budget/' + this.uid + '/' + nodeId);
    nodeRef.update({ Amount: newAmount });

    // Dismiss the modal.
    $('#budget-modal').modal('toggle');    
  },

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

  dataBuilt: function() {
    this.show();
  }

  /* -------------------- End Handlers From Event Dispatcher ----------------- */


};