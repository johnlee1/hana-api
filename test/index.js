'use strict';


const Assert = require('assert');
const Lab = require('lab');

const lab = exports.lab = Lab.script();

const experiment = lab.experiment;
const test = lab.test;

const server = require('../config/server');


experiment('users', () => {

    test('+ should add numbers together', (done) => {

        server.inject('/api/test', (res) => {
            Assert(res.payload === 'cc :)');
            done();
        })
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
