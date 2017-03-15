'use strict';


const Assert = require('assert');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const experiment = lab.experiment;
const test = lab.test;


experiment('users', () => {

    test('+ should add numbers together', (done) => {

        Assert(7 + 2 === 9);
        done();
    });

    test('- should subtract numbers', (done) => {

        Assert(10 - 2 === 8);
        done();
    });

});


experiment('modular arithmetic', () => {

    test('% should perform modulus', (done) => {

        Assert((5 + 3) % 6 === 2);
        done();
    });
});
