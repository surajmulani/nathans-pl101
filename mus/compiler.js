var endTime = function(time, expr) {
  switch (expr.tag) {
	case "note":
	  return time + expr.dur;
	case "rest":
	  return time + expr.dur;
	case "seq":
	  return endTime(endTime(time, expr.left), expr.right);
	case "par":
	  return Math.max(endTime(time, expr.left), endTime(time, expr.right));
  }
};

var compile = function (musexpr, startTime) {
  if (!startTime) startTime = 0;
  if (musexpr.tag === 'note' || musexpr.tag === 'rest') {
	musexpr.start = startTime;
	return [ musexpr ];
  } else if (musexpr.tag === 'seq') {
	var left = compile(musexpr.left, startTime),
		leftDur = endTime(startTime, musexpr.left),
		right = compile(musexpr.right, leftDur);
	return left.concat(right);
  } else {
	return compile(musexpr.left, startTime).concat(
		compile(musexpr.right, startTime));
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
	right: { tag: 'note', pitch: 'd4', dur: 500 }
  }
};

console.log(melody_mus);
console.log(compile(melody_mus));
