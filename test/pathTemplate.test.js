
var chai = require('chai');
var expect = chai.expect;

var parseTemplate = require('../lib/pathTemplate.js');


describe('parseTemplate', function () {

  describe('parsing', function () {

    it('parses the empty string', function () {
      expect(parseTemplate('').fields).to.eql([
                {prefix: '', placeholder: null}
      ]);
    });

    it('parses consecutive placeholders', function () {
      expect(parseTemplate('[id][name][query]').fields).to.eql([
                {prefix: '', placeholder: 'id'},
                {prefix: '', placeholder: 'name'},
                {prefix: '', placeholder: 'query'},
                {prefix: '', placeholder: null}
      ]);
    });

    it('parses placeholders and prefixes', function () {
      expect(parseTemplate('some[id]and[name]then[query]').fields).to.eql([
                {prefix: 'some', placeholder: 'id'},
                {prefix: 'and', placeholder: 'name'},
                {prefix: 'then', placeholder: 'query'},
                {prefix: '', placeholder: null}
      ]);
    });

    it('handles unknown placeholders', function () {
      expect(parseTemplate('some[unknown][id]then[hash:pwnd][query]').fields).to.eql([
                {prefix: 'some[unknown]', placeholder: 'id'},
                {prefix: 'then[hash:pwnd]', placeholder: 'query'},
                {prefix: '', placeholder: null}
      ]);
    });

    it('handles wierdly formatted placeholders', function () {
      expect(parseTemplate('some[chunk[id]then[whoops[query]]').fields).to.eql([
                {prefix: 'some[chunk', placeholder: 'id'},
                {prefix: 'then[whoops', placeholder: 'query'},
                {prefix: ']', placeholder: null}
      ]);
    });

    it('parses hash width syntax', function () {
      expect(parseTemplate('[hash:10]and[chunkhash:42]').fields).to.eql([
                {prefix: '', placeholder: 'hash', width: 10},
                {prefix: 'and', placeholder: 'chunkhash', width: 42},
                {prefix: '', placeholder: null}
      ]);
    });

  });

  describe('matching', function () {

    it('matches strings without placeholders', function () {
      var tpl = parseTemplate('foo-bar.jsx');
      expect(tpl.matches('foo-bar.jsx')).to.eq(true);
      expect(tpl.matches('foo-bar.css')).to.eq(false);
    });

    it('matches strings with [id] placeholder', function () {
      var tpl = parseTemplate('foo-bar.[id].js');
      expect(tpl.matches('foo-bar.666.js')).to.eq(true);
      expect(tpl.matches('foo-bar.nope.js')).to.eq(false);
    });

    it('matches strings with [name] placeholder', function () {
      var tpl = parseTemplate('[name].js');
      expect(tpl.matches('foo-bar.chunk.js')).to.eq(true);
      expect(tpl.matches('foo-bar.chunk.css')).to.eq(false);
    });

    it('matches strings with [query] placeholder', function () {
      var tpl = parseTemplate('[name].js[query]');
      expect(tpl.matches('foo-bar.js?anything')).to.eq(true);
            // query parameter is optional, so this should match too
      expect(tpl.matches('foo-bar.js')).to.eq(true);
    });

    it('matches strings with [hash] placeholder', function () {
      var tpl = parseTemplate('[name]_[hash].js');
      expect(tpl.matches('foo-bar_f00b43.js')).to.eq(true);
      expect(tpl.matches('foo-bar_w00t.js')).to.eq(false);
    });

    it('matches strings with constrained-width [hash] placeholder', function () {
      var tpl = parseTemplate('[name]_[hash:6].js');
      expect(tpl.matches('foo-bar_f00.js')).to.eq(true);
      expect(tpl.matches('foo-bar_b4d455.js')).to.eq(true);
      expect(tpl.matches('foo-bar_f00b43b47.js')).to.eq(false);
    });

  });

});
