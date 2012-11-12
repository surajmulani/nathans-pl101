var endTime = function(time, expr) {
  switch (expr.tag) {
    case "note":
      return time + expr.dur;
    case "rest":
      return time + expr.dur;
    case "repeat":
      return time + expr.count * endTime(expr.section);
    case "seq":
      return endTime(endTime(time, expr.left), expr.right);
    case "par":
      return Math.max(endTime(time, expr.left), endTime(time, expr.right));
  }
};

var convertPitch = function (pitch) {
  var bindings = { 'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11 };
  return 12 + (12 * parseInt(pitch[1])) + bindings[pitch[0]];
}

var compile = function (musexpr, startTime) {
  if (!startTime) startTime = 0;
  switch (musexpr.tag) {
    case "note":
      return [ { tag: 'note',
        pitch: convertPitch(musexpr.pitch),
        start: startTime,
        dur: musexpr.dur } ];

    case "rest":
      return [ { tag: 'rest',
        start: startTime,
        dur: musexpr.dur } ];

    case "seq":
      var left = compile(musexpr.left, startTime),
          leftDur = endTime(startTime, musexpr.left),
          right = compile(musexpr.right, leftDur);
      return left.concat(right);

    case "par":
      return compile(musexpr.left, startTime).concat(
          compile(musexpr.right, startTime));

    case "repeat":
      var result = [],
          time = startTime;
      for (i = 0; i < musexpr.count; i++) {
        result = result.concat(compile(musexpr.section, time));
        time = endTime(time, musexpr.section);
      }
      return result;
  }
};

var melody_mus = {
  tag: 'seq',
  left: {
    tag: 'seq',
    left: { tag: 'note', pitch: 'a4', dur: 250 },
    right: {
      tag: 'seq',
      left: { tag: 'note', pitch: 'b4', dur: 250 },
      right: { tag: 'rest', dur: 100 }
    }
  },
  right: {
    tag: 'seq',
    left: { tag: 'note', pitch: 'c4', dur: 500 },
    right: {
      tag: 'repeat',
      section: { tag: 'note', pitch: 'a0', dur: 250 },
      count: 2
    }
  }
};

console.log(melody_mus);
console.log(compile(melody_mus));
