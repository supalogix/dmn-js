import DecisionTableViewer from '../../helper/DecisionTableViewer';

import dmnXML from './simple.dmn';

describe('import', function() {

  let dmnDecisionTableViewer;

  beforeEach(function() {
    let container = document.createElement('div');
    
    document.body.appendChild(container);

    dmnDecisionTableViewer = new DecisionTableViewer({ container });
  });


  it('should import without errors and warnings', function(done) {
    dmnDecisionTableViewer.importXML(dmnXML, (err, importWarnings) => {
      expect(err).not.to.exist;
      expect(importWarnings).to.have.lengthOf(0);

      done();
    });
  });

});