module.exports = {
    // Allows a request to go through if a user session is present.
    isAuthed: (request, response, next) => {
        if(request.user) {
            next();
        } else {
            response.redirect('/login');
        }
    },
    // Allows a request to go through if a user session is NOT present.
    notAuthed:  (request, response, next) => {
        if(!request.user) {
            next();
        } else {
            response.redirect('/');
        }
    }
}