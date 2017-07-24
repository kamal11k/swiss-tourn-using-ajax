var request = require('request');
var url = 'http://localhost:8000/';

describe('route handler testing', function() {

    it('Home page should be rendered with an HTTP status code: 200', function() {
        request.get(url, function(err, res, body) {
            expect(res.statusCode).toBe(200);
        });
    });
});
