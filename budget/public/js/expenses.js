firebase.auth().onAuthStateChanged(function(user) {

  if (user) {

    var uid = user.uid;
    var username = user.displayName;

    renderPage(username);

    var masquerade = sessionStorage.getItem('masquerade');
    
    if (masquerade) {
      uid = masquerade;
    }

    var transactionsModel   = new TransactionsModel(),
        budgetModel         = new BudgetModel(transactionsModel),
        transactionsView    = new TransactionsView(budgetModel, transactionsModel),
        expensesController  = new ExpensesController(budgetModel, transactionsModel, transactionsView, uid);

  }

});


