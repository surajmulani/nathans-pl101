var evalSequence = function (seq, env) {
  if (seq.length === 1) {
    return evalScheem(seq[0], env);
  } else {
    evalScheem(seq[0], env);
    return evalSequence(seq.slice(1), env);
  }
};

var evalIf = function (expr, env) {
  var eq = evalScheem(expr[1], env);
  return eq !== '#f' ? evalScheem(expr[2], env) : evalScheem(expr[3], env);
};

var evalArgs = function(args, env) {
  return args.map(function (arg) {
    return evalScheem(arg, env);
  });
};

var evalLambda = function (expr, env) {
  var params = expr[1], body = expr[2];
  return function () {
    // make a new environment, bind new parameters and
    // eval the body inside new environment.
    var newEnv = { bindings : {}, outer : env };
    for (i = 0; i < params.length; i += 1) {
      newEnv.bindings[params[i]] = arguments[i];
    }
    return evalScheem(body, newEnv);
  };
};

var evalDefine = function (expr, env) {
  var _var = expr[1], body = expr[2];
  if (_var instanceof Array) { // assume a function definition
    var func = evalLambda(["lambda", _var.slice(1), body], env);
    add_binding(_var[0], func, env);
  } else { // otherwise, evaluate body and add a binding in the env.
    add_binding(_var, evalScheem(body, env), env);
  }
};

// --- environment operations ---
// lookup variable in an environment
var lookup = function (v, env) {
  if (!env || !env.hasOwnProperty('bindings')) {
    // throw exception if variable not found
    throw("Unbound variable - " + v);
  } else if (env.bindings.hasOwnProperty(v)) {
    return env.bindings[v];
  } else {
    return lookup(v, env.outer);
  }
};

var add_binding = function (_var, value, env) {
  env.bindings[_var] = value;
  return;
};

var update = function (_var, value, env) {
  if (!env || !env.hasOwnProperty('bindings')) {
    throw("Unbound variable - " + _var);
  } else if (env.bindings.hasOwnProperty(_var)) {
    env.bindings[_var] = value;
  } else {
    return update(_var, value, env.outer);
  }
};

// clone an environment's bindings and outer environment
var cloneEnv = function (env) {
  var newEnv = { };
  if (env.hasOwnProperty('bindings')) {
    newEnv.bindings = { };
    for (key in env.bindings) {
      newEnv.bindings[key] = env.bindings[key];
    }
  } if (env.hasOwnProperty('outer')) {
    newEnv.outer = cloneEnv(env.outer);
  }
  return newEnv;
};

var constants = {
  '#t' : '#t', '#f' : '#f', "nil" : []
};

var specialForms = {
  "begin" : function (expr, env) { return evalSequence(expr.slice(1), env); },
  "quote" : function (expr, env) { return expr[1]; },
  "if" : evalIf,
  "lambda" : evalLambda,
  "define" : evalDefine,
  "set!" : function (expr, env) {
    var _var = expr[1], value = evalScheem(expr[2], env);
    update(_var, value, env);
  }
};


var initialEnv = { bindings :
  {
    "+" : function (x, y) { return x + y; },
    "-" : function (x, y) { return x - y; },
    "*" : function (x, y) { return x * y; },
    "/" : function (x, y) { return x / y; },
    "cons" : function (x, y) { return [x].concat(y); },
    "car" : function (expr) { return expr[0]; },
    "cdr" : function (expr) { return expr.slice(1); },
    "=" : function (x, y) { return x === y ? '#t' : '#f' },
    "<" : function (x, y) { return x < y ? '#t' : '#f' }
  },
    outer : { }
};

// clone the initial environment
var initialClone = cloneEnv(initialEnv);

var clearEnv = function () {
  // set up a fresh environment with default functionality.
  initialEnv = initialClone;
  initialClone = cloneEnv(initialEnv);
};


var evalScheem = function (expr, env) {
  env = env || initialEnv;
  if (typeof expr === 'number') {
    return expr;
  } else if (constants.hasOwnProperty(expr)) {
    return constants[expr];
  } else if (typeof expr === 'string') {
    return lookup(expr, env);
  } else if (specialForms.hasOwnProperty(expr[0])) {
    return specialForms[expr[0]](expr, env);
  } else {
    var func = evalScheem(expr[0], env),
        args = evalArgs(expr.slice(1), env);
    return func.apply(null, args);
  }
};

// If used as a Node module, export evalScheem
if (typeof module !== 'undefined') {
  module.exports.evalScheem = evalScheem;
  module.exports.initialEnv = initialEnv;
  module.exports.clearEnv = clearEnv;
}
