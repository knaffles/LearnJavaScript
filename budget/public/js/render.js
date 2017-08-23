function renderPage(username) {

  $.get('inc/header.mst', function(template) {
    var rendered = Mustache.render(template, {sitename: "Budgeting", links: true});
    $('#header').html(rendered);
    $('#username').text('Logged in as ' + username);
    $('#content').show();
  });

}