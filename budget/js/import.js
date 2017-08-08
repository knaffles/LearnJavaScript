$('#import-categories button').on('click', function() {
  var data = $('#import-categories__data').val(),
      option = $('#import-categories__option').val();

  try {
    data = JSON.parse(data);
  } catch (e) {
    showError('Import was not successful: ' + e.message);
    data = [];
  }

  if (data.length > 0) {
    switch (option) {
      case 'budget':
        clearNode('budget').then(processBudget(data));
        break;

      case 'categories':
        clearNode('category').then(processCategories(data));
        break;

      case 'transactions':
        clearNode('transaction').then(processTransactions(data));
        break;
    }
  }
})