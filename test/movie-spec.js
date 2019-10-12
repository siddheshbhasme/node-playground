process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import app from "../src";

chai.use(chaiHttp);
chai.should();

describe("Metadata Service - Movies", () => {
  before(function (done) {
    this.timeout(3000); // A very long environment setup.
    setTimeout(done, 2500);
  });
  describe("GET /api/movies", () => {
    it("should get all movies record", (done) => {
      chai.request(app)
        .get('/api/movies')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
    it("should get all single movie record by id", (done) => {
      chai.request(app)
        .get('/api/movies/5979300')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
    it("should get all single movie record by imdbId", (done) => {
      chai.request(app)
        .get('/api/movies/tt0097576')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
    it("should get all movies records matching query filter", (done) => {
      chai.request(app)
        .get('/api/movies?id=tt0097576')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
  })
})