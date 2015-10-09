var getFileExtension = require('../lib/getFileExtension');
var expect = require('chai').expect;


function expectExtension (fileName, expected) {
  var actual = getFileExtension(fileName) ;
  expect(actual).to.eq(expected);
}


describe('getFileExt', function () {

  it('returns the right extension with simple file names', function () {
    expectExtension('main.js', 'js');
    expectExtension('main-9b913c8594ce98e06b21.js', 'js');
  });

  it('returns the right extension with query  strings', function () {
    expectExtension('main.js?9b913c8594ce98e06b21', 'js');
    expectExtension('desktop.js.map?9b913c8594ce98e06b21', 'map');
  });

});
