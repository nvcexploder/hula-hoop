var endpoint = require('../../lib/endpoints'),
    Hapi = require('hapi'),
    resourceLoader = require('../../lib/api/resource-loader'),
    path = require('path');

describe('endpoints', function() {
  var server,
      options,
      appConfig,
      caching;

  beforeEach(function(done) {
    caching = this.spy(function(request, reply) {
      reply({'winning': true});
    });
    server = new Hapi.Server(0, {
      labels: ['api']
    });

    server.start(done);
  });

  describe('#resources', function() {
    describe('#path', function() {
      it('should return the directory path', function(done) {
        this.stub(resourceLoader, 'assetContainer', function(path) {
          return path.replace(/\/\//g, '/');
        });
        var req = { params: { path: '//directory' } };
        expect(endpoint.resources().handler.directory.path(req)).to.equal('/directory');
        done();
      });

      it('should return gibberish when no path is found', function(done) {
        this.stub(resourceLoader, 'assetContainer', function(path) {
          return '';
        });
        var req = { params: { path: '/directory' } };
        expect(endpoint.resources().handler.directory.path(req)).to.equal('quijibo?!??//??////?\\/quijibo');
        done();
      });
    });
  });

  describe('#index', function() {
    it('should return the requested path', function(done) {
      this.stub(resourceLoader, 'assetContainer', function(path) {
        return 'test/artifacts';
      });
      server.route({ path: '/r/phoenix/{platform}/index.html', method: 'GET', config: endpoint.index() });
      server.inject('/r/phoenix/mweb/index.html', function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.match(/<div id="mweb"><\/div>/);
        done();
      });
    });

    it('should handle unknown paths', function(done) {
      this.stub(resourceLoader, 'assetContainer', function(path) {
        return '';
      });
      server.route({ path: '/r/phoenix/{platform}/index.html', method: 'GET', config: endpoint.index() });
      server.inject('/r/phoenix/mweb/index.html', function(res) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });
});
