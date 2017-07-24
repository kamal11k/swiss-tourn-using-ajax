var swiss = require('../lib/swisstourney.js');

describe("Tournament library testing", function() {

    it("Number of players in the tournament should be returned", function(done) {
        swiss.countPlayers(5, function(error, response) {
            expect(error).toBe(null);
            expect(response).toEqual(4);
            done();
        });
    });

    it("Sets winner in tournament table", function(done) {
        swiss.setWinner(5,'Kamal',function(error, response) {
            expect(error).toBe(null);
            expect(response).toEqual(1);
            done();
        });
    });
});
