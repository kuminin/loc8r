// GET home page
module.exports.about = function(req, res) {
    res.render('generic-text', {
        title: 'About',
        content: 'Loc8r was created to help people find places to sit down and get a bit of work done.\n\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus reprehenderit enim perspiciatis nihil dolorum, itaque vitae ex consectetur facilis, maxime laborum eius reiciendis tenetur laudantium, officiis, voluptates cum sed quasi?'
    });
};