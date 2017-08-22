var renderHeader = $.get('inc/header.mst', function(template) {
  var rendered = Mustache.render(template, {sitename: "Budgeting", links: true});
  $('#header').html(rendered);

  $('#content').show();
});