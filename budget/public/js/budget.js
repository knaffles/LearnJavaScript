var thisYear = 2017;

firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    var uid = user.uid;
    var masquerade = sessionStorage.getItem('masquerade');

    if (masquerade) {
      uid = masquerade;
    }

    var model       = new BudgetModel(uid),
        view        = new BudgetView(model, uid),
        controller  = new BudgetController(model, view, uid);
  }

});