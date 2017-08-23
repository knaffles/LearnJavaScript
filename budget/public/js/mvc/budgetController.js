var BudgetController = function (model, view, uid) {

  this.model = model;
  this.view = view;
  this.uid = uid;

  this.init();

};

BudgetController.prototype = {

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
    // this.selectTaskHandler = this.selectTask.bind(this);
    // this.unselectTaskHandler = this.unselectTask.bind(this);
    // this.completeTaskHandler = this.completeTask.bind(this);
    // this.deleteTaskHandler = this.deleteTask.bind(this);
    
    return this;
  },

  enable: function () {
    // this.view.addTaskEvent.attach(this.addTaskHandler);
    // this.view.completeTaskEvent.attach(this.completeTaskHandler);
    // this.view.deleteTaskEvent.attach(this.deleteTaskHandler);
    // this.view.selectTaskEvent.attach(this.selectTaskHandler);
    // this.view.unselectTaskEvent.attach(this.unselectTaskHandler);

    var _this = this;

    var budgetData = database.ref('budget/' + this.uid);
    var categoryData = database.ref('category/' + this.uid);

    categoryData.on('value', function(snapshotC) {

      // Assign the snapshot to the categoryLookup object.
      categoryLookup.assignRows(snapshotC.val());

      budgetData.on('value', function(snapshotB) {

        // Assign the snapshot to the categoryLookup object.
        _this.model.assignRows(snapshotB.val());
        _this.model.buildBudgetData();

      });

    })

    return this;
  }


  // addTask: function (sender, args) {
  //     debugger;
  //     this.model.addTask(args.task);
  // },

  // selectTask: function (sender, args) {
  //     this.model.setSelectedTask(args.taskIndex);
  // },

  // unselectTask: function (sender, args) {
  //     this.model.unselectTask(args.taskIndex);
  // },

  // completeTask: function () {
  //     this.model.setTasksAsCompleted();
  // },

  // deleteTask: function () {
  //     this.model.deleteTasks();
  // }

};