'use strict';

var Modeler = require('../../lib/Modeler');

var TableModeler = require('../../lib/table/Modeler');

var exampleXML = require('../fixtures/dmn/di.dmn'),
    oneDecisionXML = require('../fixtures/dmn/one-decision.dmn'),
    emptyDefsXML = require('../fixtures/dmn/empty-definitions.dmn');

var TestContainer = require('mocha-test-container-support');


describe('Modeler', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });
  }


  it('should import simple process', function(done) {
    createModeler(exampleXML, done);
  });


  it('should import empty definitions', function(done) {
    createModeler(emptyDefsXML, done);
  });


  it('should re-import simple process', function(done) {
    // given
    createModeler(exampleXML, function(err, warnings, modeler) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      modeler.importXML(exampleXML, function(err, warnings) {

        // then
        expect(err).to.not.exist;
        expect(warnings).to.have.length(0);

        done();
      });

    });

  });

  describe('interaction', function() {

    function triggerMouseEvent(type, gfx) {

      var event = document.createEvent('MouseEvent');
      event.initMouseEvent(type, true, true, window);

      return gfx.dispatchEvent(event);
    }

    it('should have a button to go to drd on table view', function(done) {
      createModeler(exampleXML, function(err, warnings, modeler) {
        modeler.showDecision(modeler.getDecisions()[0]);

        var button = modeler.table.container.querySelector('.tjs-controls button:last-child');

        expect(button.textContent).to.eql('Show DRD');

        triggerMouseEvent('click', button);

        expect(container.querySelector('.dmn-table')).to.not.exist;
        expect(container.querySelector('.dmn-diagram')).to.exist;

        done();
      });
    });

    it('not go to table view if interaction is disabled', function(done) {
      var modeler = new Modeler({ container: container, disableDrdInteraction: true });

      modeler.importXML(exampleXML, function(err, warnings) {
        var elementRegistry = modeler.get('elementRegistry');
        var el = elementRegistry.getGraphics('dish-decision');

        triggerMouseEvent('dblclick', el.node);

        expect(container.querySelector('.dmn-diagram')).to.exist;
        expect(container.querySelector('.dmn-table')).to.not.exist;

        done();
      });
    });

    it('should not have a goto drd button if interaction is disabled', function(done) {
      var modeler = new Modeler({ container: container, disableDrdInteraction: true });

      modeler.importXML(exampleXML, function(err, warnings) {
        modeler.showDecision(modeler.getDecisions()[0]);

        var button = modeler.table.container.querySelector('.tjs-controls button:last-child');

        expect(button.textContent).to.not.eql('Show DRD');

        done();
      });
    });

  });


  describe('defaults', function() {

    it('should share the same moddle', function() {

      var modeler = new Modeler();

      expect(modeler.moddle).to.equal(modeler.table.moddle);
    });


    it('should share definitions', function(done) {

      var modeler = new Modeler();

      modeler.importXML(exampleXML, function(err, warnings) {

        expect(modeler.definitions).to.eql(modeler.table.definitions);

        done(err, warnings);
      });
    });


    it('should load Table Modeler', function() {

      var modeler = new Modeler();

      expect(modeler.table).to.be.instanceof(TableModeler);
    });


    it('should use <body> as default parent', function(done) {

      var modeler = new Modeler();

      modeler.importXML(exampleXML, function(err, warnings) {

        expect(modeler.container.parentNode).to.eql(document.body);

        done(err, warnings);
      });
    });

    it('should display the table if only one decision is present', function(done) {
      var modeler = new Modeler();

      var importFired = false;

      modeler.table.on('import.done', function(e) {
        importFired = true;
      });

      modeler.importXML(oneDecisionXML, function(err, warnings) {

        expect(importFired).to.be.true;

        done(err, warnings);
      });
    });

  });


  describe('import events', function() {

    it('should emit <import.*> events', function(done) {

      // given
      var modeler = new Modeler({ container: container });

      var events = [];

      modeler.on([
        'import.parse.start',
        'import.parse.complete',
        'import.render.start',
        'import.render.complete',
        'import.done'
      ], function(e) {
        // log event type + event arguments
        events.push([
          e.type,
          Object.keys(e).filter(function(key) {
            return key !== 'type';
          })
        ]);
      });

      // when
      modeler.importXML(exampleXML, function(err) {

        // then
        expect(events).to.eql([
          [ 'import.parse.start', [ 'xml' ] ],
          [ 'import.parse.complete', ['error', 'definitions', 'context' ] ],
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ],
          [ 'import.done', [ 'error', 'warnings' ] ]
        ]);

        done(err);
      });
    });

  });

});
