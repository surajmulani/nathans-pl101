var PEG = require('pegjs'),
    chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should(),
    path = require('path'),
    fs = require('fs');

var musGrammar = path.join(__dirname, '../parser.peg'),
    data = fs.readFileSync(musGrammar, 'utf-8')
    parse = PEG.buildParser(data).parse;

var noteWith = function (notePitch, duration) {
  return { tag : 'note', pitch : notePitch, dur : duration };
};

var seqWith = function (_left, _right) {
  return { tag : 'seq', left : _left, right : _right };
};

var parWith = function(_left, _right) {
  return { tag : 'par', left : _left, right : _right };
};

describe('notes', function () {
  it("should parse single notes", function () {
    assert.deepEqual(parse("a4[200]"), noteWith('a4', 200));
    assert.deepEqual(parse("g4[10]"), noteWith('g4', 10));
  });
});

describe("sequences", function () {
  assert.deepEqual(
    parse("c4[200] f2[500]"),
    seqWith( noteWith('c4', 200), noteWith('f2', 500) ));
  assert.deepEqual(
    parse("[d6[100] b8[900]]"),
    seqWith( noteWith('d6', 100), noteWith('b8', 900) ));
  assert.deepEqual(
    parse("g3[150] b4[300] a2[100] c7[600]"),
    seqWith(
      seqWith(
        seqWith( noteWith('g3', 150),
          noteWith('b4', 300)),
        noteWith('a2', 100)),
      noteWith('c7', 600)));
  it("should allow nested sequences", function () {
    assert.deepEqual(
      parse("a5[320] [g5[240] b6[50]]"),
      seqWith(
        noteWith('a5', 320),
        seqWith( noteWith('g5', 240), noteWith('b6', 50))));
  });
  it("should allow singleton notes inside", function () {
    assert.deepEqual(parse("[a5[320]]"), noteWith('a5', 320));
  });
});

describe("parallel sequence", function () {
  it("should parse simple sequences", function () {
    assert.deepEqual(
      parse("(c4[200] f4[300])"),
      parWith( noteWith('c4', 200), noteWith('f4', 300) ));
  });
  it("should parse nested sequences", function () {
    assert.deepEqual(
      parse("(c4[200] (f4[200] g7[80]))"),
      parWith( noteWith('c4', 200),
        parWith( noteWith('f4', 200), noteWith('g7', 80))));
  });
  it("should allow single expressions inside", function () {
    assert.deepEqual(parse("(c4[200])"), noteWith('c4', 200));
  });
});

describe("repeats and rests", function () {
  it("should repeat a note", function () {
    assert.deepEqual(
      parse("{ a3[200] : 3 }"),
      { tag : 'repeat', section : noteWith('a3', 200), count : 3 });
  });
  it("should allow rests", function () {
    assert.deepEqual(parse("!30"), { tag : 'rest', dur : 30 });
  });
});

it("should allow arbitrary whitespaces", function () {
  assert.deepEqual(
    parse("  \n\ta4[200]\n\t  f8[800]\t\n"),
    seqWith( noteWith('a4', 200), noteWith('f8', 800)));
  assert.deepEqual(
    parse(" \n(b3[400]\n\te7[100]\t\n)\n\n"),
    parWith( noteWith('b3', 400), noteWith('e7', 100)));
});
