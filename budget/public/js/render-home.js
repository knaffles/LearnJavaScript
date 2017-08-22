var renderHeader = $.get('inc/header.mst', function(template) {
  var rendered = Mustache.render(template, {sitename: "Budgeting", links: false});
  $('#header').html(rendered);
});