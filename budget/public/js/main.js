var thisYear = 2018;

var categoryLookup = {
  categories: [],

  // Given a firebase snapshot, assign to the categories property.
  assignRows: function(snapshot) {
    // Convert the object to an array.
    snapshot = convertObjToArray(snapshot);

    // Assign the array to the lookup object.
    this.categories = snapshot;
  },

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

function buildCategoryLink(category, fullCategory, month, year) {
  var url = '/transactions/' + cleanMe(category) + '/' + month + '/' + year;
  var urlYTD = url + '/ytd';
  return '<a data-category="' + category + '" href="' + url + '" class="category-link">' + fullCategory + '</a> <a data-category="' + category + '" href="' + urlYTD + '" class="category-link">(YTD)</a>';
}

function cleanMe(aString) {
  return aString.toLowerCase().replace(/ /g,'').replace(/\//g,'');
}

// Given an object of objects, convert it to an array of objects.
function convertObjToArray(obj) {
  // Convert the object to an array.
  var objArray = [],
      objArrayItem = {};

  for (var key in obj) {
    // Skip the loop if the property is from prototype.
    if (!obj.hasOwnProperty(key)) continue;

    objArrayItem = obj[key];
    objArrayItem.nodeId = key;

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

function showError(error) {
  var errorString = '<div class="alert">' + error + '</div>';
  $('body').prepend(errorString);
}