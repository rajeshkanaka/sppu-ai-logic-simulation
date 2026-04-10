// === SPPU AI Logic Simulation — App Engine ===
// Note: All HTML content is from hardcoded educational data, not user input. Safe for innerHTML.

// ==================== NAVIGATION ====================
function showSection(id) {
  document.querySelectorAll('.section').forEach(function(sec) { sec.classList.remove('active'); });
  document.querySelectorAll('.topnav button').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('sec-' + id).classList.add('active');
  event.target.classList.add('active');
  window.scrollTo(0, 0);
}

// ==================== HELPER: safe step builder ====================
function makeStep(text, cls) {
  var div = document.createElement('div');
  div.className = 'step';
  if (cls) {
    var span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    div.appendChild(span);
  } else {
    div.textContent = text;
  }
  return div;
}

function clearAndAppendSteps(targetId, steps, delay) {
  var el = document.getElementById(targetId);
  el.textContent = '';
  steps.forEach(function(step, i) {
    setTimeout(function() {
      el.appendChild(makeStep(step.text, step.cls || ''));
    }, (delay || 0) * i);
  });
}

function setStepsImmediate(targetId, steps) {
  var el = document.getElementById(targetId);
  el.textContent = '';
  steps.forEach(function(step) {
    el.appendChild(makeStep(step.text, step.cls || ''));
  });
}

// ==================== PL vs FOL DATA ====================
var plfolData = [
  {
    eng: "All birds fly",
    pl: "We must write SEPARATE statements for EACH bird:\n\nB_Tweety = \"Tweety is a bird\"  (TRUE)\nF_Tweety = \"Tweety can fly\"    (TRUE)\nB_Tweety => F_Tweety           (If Tweety is bird, Tweety flies)\n\nB_Sparrow = \"Sparrow is a bird\" (TRUE)\nF_Sparrow = \"Sparrow can fly\"   (TRUE)\nB_Sparrow => F_Sparrow\n\nProblem: Cannot say \"ALL\" - must list each bird individually!",
    fol: "ForAll x: Bird(x) => Fly(x)\n\nRead: \"For ALL x, IF x is a Bird, THEN x can Fly\"\n\nOne single sentence covers ALL birds!\n\nParse Tree:\n  ForAll x       <-- Universal quantifier (for all)\n  |-- =>         <-- Implication (paired with ForAll)\n      |-- Bird(x)   <-- Predicate: \"x is a bird\"\n      |-- Fly(x)    <-- Predicate: \"x can fly\"",
    why: "Why FOL is better here: PL needs N statements for N birds. FOL uses ONE statement with ForAll (universal quantifier). The ForAll always pairs with => (implication) - this is the \"For all... if... then...\" pattern."
  },
  {
    eng: "Some boys like football",
    pl: "Need separate statements:\n\nLikes_Rahul_Football = TRUE\nLikes_Amit_Football  = TRUE\n\nCannot express \"some\" - must name specific boys!",
    fol: "Exists x: Boys(x) AND Likes(x, Football)\n\nRead: \"There EXISTS some x such that x is a Boy AND x Likes Football\"\n\nParse Tree:\n  Exists x        <-- Existential quantifier (there exists)\n  |-- AND         <-- Conjunction (paired with Exists)\n      |-- Boys(x)         <-- Predicate\n      |-- Likes(x, Football) <-- 2-place predicate with constant",
    why: "Key Pairing Rule: Exists (existential) ALWAYS pairs with AND, not =>. Why? Because \"Exists x: Boys(x) => Likes(x, Football)\" would be true even if x is a chair (vacuously true when Boys(chair) is false). The AND ensures x is BOTH a boy AND likes football."
  },
  {
    eng: "Every man respects his parents",
    pl: "For Rahul and Sunita specifically:\n\nM_R = \"Rahul is a man\"         (TRUE)\nP_SR = \"Sunita is Rahul's parent\" (TRUE)\nRESP_RS = \"Rahul respects Sunita\"\n\n(M_R AND P_SR) => RESP_RS\n\nMust write separately for EACH man-parent pair!",
    fol: "ForAll x: ForAll y: (Man(x) AND Parent(y, x)) => Respects(x, y)\n\nRead: \"For ALL x, for ALL y, IF x is a Man AND y is Parent of x, THEN x Respects y\"\n\nParse Tree:\n  ForAll x ForAll y    <-- Two universal quantifiers\n  |-- =>\n      |-- AND\n      |   |-- Man(x)\n      |   |-- Parent(y, x)  <-- 2-place predicate\n      |-- Respects(x, y)   <-- 2-place predicate",
    why: "Multiple Quantifiers: When a statement involves relationships between TWO entities (man and parent), we need TWO variables with quantifiers. The ForAll...ForAll... with => pattern means \"for every possible combination where the condition holds, the conclusion follows.\""
  },
  {
    eng: "Rahul is a student",
    pl: "S = \"Rahul is a student\"    (S = TRUE)\n\nSimple! PL works fine for individual facts.\nNo quantifiers needed, so PL is sufficient here.",
    fol: "Student(Rahul)\n\nRead: \"Rahul has the property Student\"\n\n  Student --> Predicate (property)\n  Rahul --> Constant (specific object)\n\nAlso simple in FOL. Both logics handle individual facts well.",
    why: "When PL is enough: For simple individual facts about specific named entities, PL works perfectly fine. FOL becomes necessary only when you need to express general rules (ForAll) or existence claims (Exists)."
  },
  {
    eng: "No person buys expensive policy",
    pl: "Must negate for each person:\n\nNOT Buys_Rahul_ExpPolicy\nNOT Buys_Sunita_ExpPolicy\nNOT Buys_Amit_ExpPolicy\n...\n\nImpossible to cover \"No person\" = must list everyone!",
    fol: "NOT Exists x: Person(x) AND Buys(x, ExpensivePolicy)\n\nOR equivalently:\nForAll x: Person(x) => NOT Buys(x, ExpensivePolicy)\n\nRead: \"There does NOT exist any x such that x is a Person and x Buys ExpensivePolicy\"\n\nNote: NOT Exists x P(x)  =  ForAll x NOT P(x)  (De Morgan for quantifiers)",
    why: "Negation + Quantifiers: \"No\" = NOT Exists (there does not exist). This is equivalent to ForAll...NOT (for all, NOT). This De Morgan's law for quantifiers is frequently asked in exams!"
  },
  {
    eng: "All girls love pink",
    pl: "Loves_Sita_Pink = TRUE\nLoves_Gita_Pink = TRUE\n...\n\nSame problem - cannot say \"all\"",
    fol: "ForAll x: Girls(x) => Loves(x, Pink)\n\nRead: \"For ALL x, IF x is a Girl, THEN x Loves Pink\"\n\nParse Tree:\n  ForAll x\n  |-- =>         <-- ForAll paired with =>\n      |-- Girls(x)\n      |-- Loves(x, Pink)  <-- Pink is a constant",
    why: "ForAll + => Pattern: \"All X are Y\" = ForAll x: X(x) => Y(x). This is the most common FOL pattern. The constant \"Pink\" appears as an argument to the predicate Loves."
  }
];

function showPLFOL(idx, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  var d = plfolData[idx];
  document.getElementById('plResult').textContent = d.pl;
  document.getElementById('folResult').textContent = d.fol;
  document.getElementById('plfolExplanation').textContent = d.why;
}

// ==================== TRUTH TABLE ====================
function showTruthTable(op, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  var area = document.getElementById('truthTableArea');
  var exp = document.getElementById('truthExplanation');

  var tableData = {
    not: {
      headers: ['P', 'NOT P'],
      rows: [['T', 'F'], ['F', 'T']],
      explanation: "NOT: Flips truth value. \"It is NOT raining\" is true when \"It is raining\" is false."
    },
    and: {
      headers: ['P', 'Q', 'P AND Q'],
      rows: [['T','T','T'], ['T','F','F'], ['F','T','F'], ['F','F','F']],
      explanation: "AND: True ONLY when BOTH are true. Like a strict boss - everyone must show up! \"It is raining AND cold\" is true only when BOTH conditions hold."
    },
    or: {
      headers: ['P', 'Q', 'P OR Q'],
      rows: [['T','T','T'], ['T','F','T'], ['F','T','T'], ['F','F','F']],
      explanation: "OR: True when AT LEAST ONE is true. Like a lenient boss - at least one person needs to show up!"
    },
    implies: {
      headers: ['P', 'Q', 'P => Q', 'Meaning'],
      rows: [
        ['T','T','T','Promise kept'],
        ['T','F','F','Promise BROKEN'],
        ['F','T','T','Promise not tested'],
        ['F','F','T','Promise not tested']
      ],
      explanation: "IMPLIES: Think of it as a PROMISE. \"If I score 100%, I'll buy pizza.\" Only FALSE when condition is true but result is false (promise broken). KEY: P => Q is same as (NOT P) OR Q - This conversion appears in EVERY exam!"
    },
    biconditional: {
      headers: ['P', 'Q', 'P <=> Q'],
      rows: [['T','T','T'], ['T','F','F'], ['F','T','F'], ['F','F','T']],
      explanation: "BICONDITIONAL: \"P if and only if Q\" - true when both have the SAME truth value. P <=> Q = (P=>Q) AND (Q=>P)."
    }
  };

  var td = tableData[op];

  // Build table using DOM
  area.textContent = '';
  var table = document.createElement('table');
  table.className = 'truth-table';

  var thead = document.createElement('tr');
  td.headers.forEach(function(h) {
    var th = document.createElement('th');
    th.textContent = h;
    thead.appendChild(th);
  });
  table.appendChild(thead);

  td.rows.forEach(function(row) {
    var tr = document.createElement('tr');
    row.forEach(function(cell) {
      var tdEl = document.createElement('td');
      tdEl.textContent = cell;
      if (cell === 'T') tdEl.className = 'val-true';
      else if (cell === 'F') tdEl.className = 'val-false';
      tr.appendChild(tdEl);
    });
    table.appendChild(tr);
  });
  area.appendChild(table);
  exp.textContent = td.explanation;
}

// ==================== INFERENCE RULES ====================
var ruleExamples = {
  mp: {
    title: "Modus Ponens",
    examples: [
      {
        name: "Rain -> Wet Ground",
        steps: [
          { text: 'Given: P is TRUE  (It is raining)', cls: 'highlight' },
          { text: 'Given: P => Q     (If raining, ground is wet)', cls: 'rule-name' },
          { text: 'Apply Modus Ponens: P is TRUE and P => Q', cls: '' },
          { text: 'Therefore: Q is TRUE  (Ground IS wet)', cls: 'highlight' }
        ]
      },
      {
        name: "Study -> Pass",
        steps: [
          { text: 'Given: S is TRUE  (Rahul studies)', cls: 'highlight' },
          { text: 'Given: S => P     (If studies, then passes)', cls: 'rule-name' },
          { text: 'Apply Modus Ponens: S is TRUE and S => P', cls: '' },
          { text: 'Therefore: P is TRUE  (Rahul PASSES)', cls: 'highlight' }
        ]
      }
    ],
    customLabels: ["A (premise, e.g., Raining)", "B (conclusion, e.g., Ground wet)"],
    customRun: function(a, b) {
      return [
        { text: 'Given: ' + a + ' is TRUE', cls: 'highlight' },
        { text: 'Given: ' + a + ' => ' + b, cls: 'rule-name' },
        { text: 'Modus Ponens: ' + a + ' is TRUE and ' + a + ' => ' + b, cls: '' },
        { text: 'Therefore: ' + b + ' is TRUE', cls: 'highlight' }
      ];
    }
  },
  mt: {
    title: "Modus Tollens",
    examples: [
      {
        name: "Not Happy -> Not Sunny",
        steps: [
          { text: 'Given: S => H     (If sunny, then happy)', cls: 'rule-name' },
          { text: 'Given: NOT H      (We are NOT happy)', cls: 'neg' },
          { text: 'Apply Modus Tollens: S => H and NOT H', cls: '' },
          { text: 'If sunny would make us happy, but we are NOT happy...', cls: '' },
          { text: 'Therefore: NOT S  (It is NOT sunny)', cls: 'highlight' }
        ]
      },
      {
        name: "Not Wet -> Not Raining",
        steps: [
          { text: 'Given: P => Q     (If raining, ground wet)', cls: 'rule-name' },
          { text: 'Given: NOT Q      (Ground is NOT wet)', cls: 'neg' },
          { text: 'Modus Tollens: If the consequence did not happen...', cls: '' },
          { text: 'Therefore: NOT P  (It is NOT raining)', cls: 'highlight' }
        ]
      }
    ],
    customLabels: ["A (cause, e.g., Raining)", "B (effect, e.g., Ground wet)"],
    customRun: function(a, b) {
      return [
        { text: 'Given: ' + a + ' => ' + b, cls: 'rule-name' },
        { text: 'Given: NOT ' + b + ' (' + b + ' is FALSE)', cls: 'neg' },
        { text: 'Modus Tollens: ' + a + ' => ' + b + ' and NOT ' + b, cls: '' },
        { text: 'Therefore: NOT ' + a + ' (' + a + ' is FALSE)', cls: 'highlight' }
      ];
    }
  },
  ai: {
    title: "And-Introduction",
    examples: [
      {
        name: "Rahul is man AND Sunita is parent",
        steps: [
          { text: 'Given: M_R is TRUE    (Rahul is a man)', cls: 'highlight' },
          { text: 'Given: P_SR is TRUE   (Sunita is Rahul\'s parent)', cls: 'highlight' },
          { text: 'Apply And-Introduction: Both are TRUE', cls: '' },
          { text: 'Therefore: (M_R AND P_SR) is TRUE', cls: 'highlight' }
        ]
      }
    ],
    customLabels: ["A (first fact)", "B (second fact)"],
    customRun: function(a, b) {
      return [
        { text: 'Given: ' + a + ' is TRUE', cls: 'highlight' },
        { text: 'Given: ' + b + ' is TRUE', cls: 'highlight' },
        { text: 'And-Introduction: Both are TRUE', cls: '' },
        { text: 'Therefore: (' + a + ' AND ' + b + ') is TRUE', cls: 'highlight' }
      ];
    }
  },
  ae: {
    title: "And-Elimination",
    examples: [
      {
        name: "Extract from conjunction",
        steps: [
          { text: 'Given: (P AND Q) is TRUE  (Raining AND Cold)', cls: 'highlight' },
          { text: 'Apply And-Elimination:', cls: '' },
          { text: 'Therefore: P is TRUE  (It IS raining)', cls: 'highlight' },
          { text: 'Therefore: Q is TRUE  (It IS cold)', cls: 'highlight' },
          { text: 'We can extract EITHER conjunct individually!', cls: 'rule-name' }
        ]
      }
    ],
    customLabels: ["A (first conjunct)", "B (second conjunct)"],
    customRun: function(a, b) {
      return [
        { text: 'Given: (' + a + ' AND ' + b + ') is TRUE', cls: 'highlight' },
        { text: 'And-Elimination:', cls: '' },
        { text: 'Therefore: ' + a + ' is TRUE', cls: 'highlight' },
        { text: 'Therefore: ' + b + ' is TRUE', cls: 'highlight' }
      ];
    }
  },
  oi: {
    title: "Or-Introduction",
    examples: [
      {
        name: "Expand a known fact",
        steps: [
          { text: 'Given: P is TRUE      (It is raining)', cls: 'highlight' },
          { text: 'Apply Or-Introduction: We can add ANY statement!', cls: '' },
          { text: 'Therefore: (P OR Q) is TRUE  (Raining OR Snow)', cls: 'highlight' },
          { text: 'Therefore: (P OR R) is TRUE  (Raining OR Sunny)', cls: 'highlight' },
          { text: 'Since P is true, P OR ANYTHING is always true!', cls: 'rule-name' }
        ]
      }
    ],
    customLabels: ["A (known true fact)", "B (any statement to add)"],
    customRun: function(a, b) {
      return [
        { text: 'Given: ' + a + ' is TRUE', cls: 'highlight' },
        { text: 'Or-Introduction: Add any B', cls: '' },
        { text: 'Therefore: (' + a + ' OR ' + b + ') is TRUE', cls: 'highlight' }
      ];
    }
  },
  res: {
    title: "Resolution",
    examples: [
      {
        name: "John is Smart",
        steps: [
          { text: 'Clause 1: S v M       (Student OR Smart)', cls: 'rule-name' },
          { text: 'Clause 2: ~S          (NOT Student)', cls: 'neg' },
          { text: 'Resolve on S: S appears positive in C1, negative in C2', cls: '' },
          { text: 'S and ~S cancel each other out!', cls: 'neg' },
          { text: 'Resolvent: M          (John IS smart)', cls: 'highlight' }
        ]
      },
      {
        name: "Two multi-literal clauses",
        steps: [
          { text: 'Clause 1: A v B', cls: 'rule-name' },
          { text: 'Clause 2: ~A v C', cls: 'rule-name' },
          { text: 'Resolve on A: A (positive in C1) and ~A (negative in C2)', cls: '' },
          { text: 'Cancel A and ~A, combine remaining:', cls: 'neg' },
          { text: 'Resolvent: B v C', cls: 'highlight' }
        ]
      }
    ],
    customLabels: ["Clause 1 (e.g., A v B)", "Clause 2 (e.g., ~A v C)"],
    customRun: function(c1, c2) {
      return [
        { text: 'Clause 1: ' + c1, cls: 'rule-name' },
        { text: 'Clause 2: ' + c2, cls: 'rule-name' },
        { text: 'Find complementary literals and resolve...', cls: '' },
        { text: 'Remaining literals combined into resolvent', cls: 'highlight' }
      ];
    }
  }
};

var currentRule = 'mp';

function selectRule(ruleId, el) {
  document.querySelectorAll('.rule-card').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  currentRule = ruleId;
  var rule = ruleExamples[ruleId];
  document.getElementById('demoTitle').textContent = 'Live Demo: ' + rule.title;

  var pills = document.getElementById('demoPills');
  pills.textContent = '';
  rule.examples.forEach(function(ex, i) {
    var span = document.createElement('span');
    span.className = 'pill' + (i === 0 ? ' active' : '');
    span.textContent = ex.name;
    span.onclick = function() { showRuleExample(i, span); };
    pills.appendChild(span);
  });

  showRuleExample(0, pills.querySelector('.pill'));
  buildCustomInputs(rule);
}

function showRuleExample(idx, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  var ex = ruleExamples[currentRule].examples[idx];
  clearAndAppendSteps('demoResult', ex.steps, 400);
}

function buildCustomInputs(rule) {
  var area = document.getElementById('customInputs');
  area.textContent = '';
  rule.customLabels.forEach(function(label, i) {
    var lbl = document.createElement('label');
    lbl.textContent = label + ':';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.id = 'customIn' + i;
    inp.placeholder = 'Enter value...';
    area.appendChild(lbl);
    area.appendChild(inp);
  });
  document.getElementById('customResult').style.display = 'none';
}

function runCustom() {
  var rule = ruleExamples[currentRule];
  var inputs = rule.customLabels.map(function(_, i) {
    return document.getElementById('customIn' + i).value || 'X';
  });
  var result = document.getElementById('customResult');
  result.style.display = 'block';
  var steps = rule.customRun.apply(null, inputs);
  setStepsImmediate('customResult', steps);
}

// ==================== CHAIN PROOF DEMOS ====================
var chainProofs = [
  {
    name: "Rain -> Slippery Road",
    steps: [
      { text: '--- Knowledge Base ---', cls: 'rule-name' },
      { text: 'S1: P          (It is raining)', cls: '' },
      { text: 'S2: P => Q     (If raining, ground is wet)', cls: '' },
      { text: 'S3: Q => R     (If ground wet, road is slippery)', cls: '' },
      { text: '', cls: '' },
      { text: '--- Proof: Prove R (Road is slippery) ---', cls: 'rule-name' },
      { text: 'Step 1: P is TRUE                           [from S1]', cls: 'highlight' },
      { text: 'Step 2: P => Q                              [from S2]', cls: '' },
      { text: 'Step 3: MODUS PONENS on S1 + S2:', cls: 'rule-name' },
      { text: '        P is TRUE and P => Q', cls: '' },
      { text: '        Therefore Q is TRUE  (Ground is wet)', cls: 'highlight' },
      { text: 'Step 4: Q => R                              [from S3]', cls: '' },
      { text: 'Step 5: MODUS PONENS on Step 3 + S3:', cls: 'rule-name' },
      { text: '        Q is TRUE and Q => R', cls: '' },
      { text: '        Therefore R is TRUE  (Road IS slippery)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: R is TRUE. "The road is slippery."', cls: 'highlight' },
      { text: 'Rules used: Modus Ponens (twice, chained)', cls: 'rule-name' }
    ]
  },
  {
    name: "Rahul Respects Sunita",
    steps: [
      { text: '--- Knowledge Base ---', cls: 'rule-name' },
      { text: 'S1: M_R                          (Rahul is a man)', cls: '' },
      { text: 'S2: P_SR                         (Sunita is Rahul\'s parent)', cls: '' },
      { text: 'S3: (M_R AND P_SR) => RESP_RS    (If man AND parent, then respects)', cls: '' },
      { text: '', cls: '' },
      { text: '--- Proof: Prove RESP_RS (Rahul respects Sunita) ---', cls: 'rule-name' },
      { text: 'Step 1: M_R is TRUE                         [from S1]', cls: 'highlight' },
      { text: 'Step 2: P_SR is TRUE                        [from S2]', cls: 'highlight' },
      { text: 'Step 3: AND-INTRODUCTION on S1 + S2:', cls: 'rule-name' },
      { text: '        M_R TRUE and P_SR TRUE', cls: '' },
      { text: '        Therefore (M_R AND P_SR) is TRUE', cls: 'highlight' },
      { text: 'Step 4: MODUS PONENS on Step 3 + S3:', cls: 'rule-name' },
      { text: '        (M_R AND P_SR) TRUE and (M_R AND P_SR) => RESP_RS', cls: '' },
      { text: '        Therefore RESP_RS is TRUE', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: "Rahul respects Sunita"', cls: 'highlight' },
      { text: 'Rules used: And-Introduction + Modus Ponens', cls: 'rule-name' }
    ]
  },
  {
    name: "West is Criminal",
    steps: [
      { text: '--- Knowledge Base ---', cls: 'rule-name' },
      { text: 'S1: A            (West is American)', cls: '' },
      { text: 'S2: E            (Nono is enemy of America)', cls: '' },
      { text: 'S3: S            (West sold missiles to Nono)', cls: '' },
      { text: 'S4: (A AND E AND S AND W) => C  (If American sells weapons to enemy -> criminal)', cls: '' },
      { text: 'S5: W            (Missiles are weapons)', cls: '' },
      { text: '', cls: '' },
      { text: '--- Proof: Prove C (West is a criminal) ---', cls: 'rule-name' },
      { text: 'Step 1: A is TRUE                           [from S1]', cls: 'highlight' },
      { text: 'Step 2: E is TRUE                           [from S2]', cls: 'highlight' },
      { text: 'Step 3: S is TRUE                           [from S3]', cls: 'highlight' },
      { text: 'Step 4: W is TRUE                           [from S5]', cls: 'highlight' },
      { text: 'Step 5: AND-INTRODUCTION on S1,S2,S3,S5:', cls: 'rule-name' },
      { text: '        (A AND E AND S AND W) is TRUE', cls: 'highlight' },
      { text: 'Step 6: MODUS PONENS on Step 5 + S4:', cls: 'rule-name' },
      { text: '        (A AND E AND S AND W) TRUE and ... => C', cls: '' },
      { text: '        Therefore C is TRUE', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: C is TRUE. "West is a criminal."', cls: 'highlight' },
      { text: 'Rules used: And-Introduction + Modus Ponens', cls: 'rule-name' }
    ]
  },
  {
    name: "Not Sunny (Modus Tollens Chain)",
    steps: [
      { text: '--- Knowledge Base ---', cls: 'rule-name' },
      { text: 'S1: S => P       (If sunny, we go to park)', cls: '' },
      { text: 'S2: P => H       (If park, we are happy)', cls: '' },
      { text: 'S3: ~H           (We are NOT happy)', cls: 'neg' },
      { text: '', cls: '' },
      { text: '--- Proof: Prove ~S (It is NOT sunny) ---', cls: 'rule-name' },
      { text: 'Step 1: P => H                              [from S2]', cls: '' },
      { text: 'Step 2: ~H                                  [from S3]', cls: 'neg' },
      { text: 'Step 3: MODUS TOLLENS on S2 + S3:', cls: 'rule-name' },
      { text: '        P => H is TRUE, and H is FALSE (~H)', cls: '' },
      { text: '        Therefore P is FALSE (~P)', cls: 'highlight' },
      { text: '        (We did NOT go to the park)', cls: '' },
      { text: 'Step 4: S => P                              [from S1]', cls: '' },
      { text: 'Step 5: MODUS TOLLENS on S1 + Step 3:', cls: 'rule-name' },
      { text: '        S => P is TRUE, and P is FALSE (~P)', cls: '' },
      { text: '        Therefore S is FALSE (~S)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: ~S is TRUE. "It is NOT sunny."', cls: 'highlight' },
      { text: 'Rules used: Modus Tollens (twice, chained backwards)', cls: 'rule-name' }
    ]
  }
];

function showChainProof(idx, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  clearAndAppendSteps('chainResult', chainProofs[idx].steps, 300);
}

// ==================== FOL BUILDER ====================
function addFOL(sym) {
  var inp = document.getElementById('folInput');
  inp.value += sym;
  inp.focus();
}

function parseFOL() {
  var input = document.getElementById('folInput').value.trim();
  var result = document.getElementById('folParseResult');
  result.style.display = 'block';
  result.textContent = '';

  if (!input) {
    result.appendChild(makeStep('Please enter a FOL sentence to parse.', 'neg'));
    return;
  }

  var steps = [
    { text: '--- Parsing FOL Sentence ---', cls: 'rule-name' },
    { text: 'Input: ' + input, cls: 'highlight' }
  ];

  // Detect components
  if (input.indexOf('∀') !== -1 || input.toLowerCase().indexOf('forall') !== -1) {
    steps.push({ text: 'Found: Universal Quantifier (ForAll) - "for all objects"', cls: 'rule-name' });
    steps.push({ text: 'Remember: ForAll always pairs with => (implication)', cls: '' });
  }
  if (input.indexOf('∃') !== -1 || input.toLowerCase().indexOf('exists') !== -1) {
    steps.push({ text: 'Found: Existential Quantifier (Exists) - "there exists"', cls: 'rule-name' });
    steps.push({ text: 'Remember: Exists always pairs with AND (conjunction)', cls: '' });
  }
  if (input.indexOf('⇒') !== -1 || input.indexOf('=>') !== -1) {
    steps.push({ text: 'Found: Implication (=>)', cls: '' });
  }
  if (input.indexOf('∧') !== -1 || input.indexOf('AND') !== -1) {
    steps.push({ text: 'Found: Conjunction (AND)', cls: '' });
  }
  if (input.indexOf('∨') !== -1 || input.indexOf('OR') !== -1) {
    steps.push({ text: 'Found: Disjunction (OR)', cls: '' });
  }
  if (input.indexOf('¬') !== -1 || input.indexOf('NOT') !== -1 || input.indexOf('~') !== -1) {
    steps.push({ text: 'Found: Negation (NOT)', cls: 'neg' });
  }

  // Find predicates (word followed by parenthesis)
  var predMatch = input.match(/[A-Z][a-zA-Z]*\s*\(/g);
  if (predMatch) {
    var preds = predMatch.map(function(p) { return p.replace('(', '').trim(); });
    steps.push({ text: 'Predicates found: ' + preds.join(', '), cls: 'highlight' });
  }

  // Find variables
  var varMatch = input.match(/\b[xyz]\b/g);
  if (varMatch) {
    var uniqVars = varMatch.filter(function(v, i, a) { return a.indexOf(v) === i; });
    steps.push({ text: 'Variables: ' + uniqVars.join(', '), cls: '' });
  }

  steps.push({ text: '--- Parse Complete ---', cls: 'rule-name' });
  setStepsImmediate('folParseResult', steps);
}

// ==================== FOL COMPLEX EXAMPLES ====================
var folExamples = [
  {
    eng: "All boys like Cricket",
    fol: "ForAll x: Boys(x) => Likes(x, Cricket)",
    parse: [
      { text: '--- English: "All boys like Cricket" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: Identify the pattern', cls: 'rule-name' },
      { text: '  "All X do Y" => ForAll quantifier with =>', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 2: Define components', cls: 'rule-name' },
      { text: '  Variable: x (any person)', cls: '' },
      { text: '  Predicate: Boys(x) - "x is a boy"', cls: '' },
      { text: '  Predicate: Likes(x, Cricket) - "x likes Cricket"', cls: '' },
      { text: '  Constant: Cricket', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 3: Construct FOL', cls: 'rule-name' },
      { text: '  ForAll x: Boys(x) => Likes(x, Cricket)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Read: "For all x, if x is a boy, then x likes Cricket"', cls: '' },
      { text: 'Pairing: ForAll + => (correct!)', cls: 'highlight' }
    ]
  },
  {
    eng: "Some boys like Football",
    fol: "Exists x: Boys(x) AND Likes(x, Football)",
    parse: [
      { text: '--- English: "Some boys like Football" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: Identify the pattern', cls: 'rule-name' },
      { text: '  "Some X do Y" => Exists quantifier with AND', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 2: Define components', cls: 'rule-name' },
      { text: '  Variable: x', cls: '' },
      { text: '  Predicate: Boys(x) - "x is a boy"', cls: '' },
      { text: '  Predicate: Likes(x, Football)', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 3: Construct FOL', cls: 'rule-name' },
      { text: '  Exists x: Boys(x) AND Likes(x, Football)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Pairing: Exists + AND (correct!)', cls: 'highlight' },
      { text: 'WARNING: Using => instead of AND would be WRONG!', cls: 'neg' }
    ]
  },
  {
    eng: "Some girls hate Football",
    fol: "Exists x: Girls(x) AND Hates(x, Football)",
    parse: [
      { text: '--- English: "Some girls hate Football" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Pattern: "Some X do Y" => Exists + AND', cls: '' },
      { text: '', cls: '' },
      { text: 'FOL: Exists x: Girls(x) AND Hates(x, Football)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Components:', cls: 'rule-name' },
      { text: '  Exists x    - existential quantifier', cls: '' },
      { text: '  Girls(x)    - unary predicate', cls: '' },
      { text: '  AND         - conjunction (paired with Exists)', cls: '' },
      { text: '  Hates(x, Football) - binary predicate', cls: '' }
    ]
  },
  {
    eng: "All girls love Pink",
    fol: "ForAll x: Girls(x) => Loves(x, Pink)",
    parse: [
      { text: '--- English: "All girls love Pink" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Pattern: "All X do Y" => ForAll + =>', cls: '' },
      { text: '', cls: '' },
      { text: 'FOL: ForAll x: Girls(x) => Loves(x, Pink)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Parse Tree:', cls: 'rule-name' },
      { text: '  ForAll x', cls: '' },
      { text: '  |-- =>', cls: '' },
      { text: '      |-- Girls(x)', cls: '' },
      { text: '      |-- Loves(x, Pink)   [Pink = constant]', cls: '' }
    ]
  },
  {
    eng: "Every person who buys a policy is smart",
    fol: "ForAll x: ForAll y: (Person(x) AND Policy(y) AND Buys(x, y)) => Smart(x)",
    parse: [
      { text: '--- English: "Every person who buys a policy is smart" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: Two entities involved: person (x) and policy (y)', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 2: Define predicates', cls: 'rule-name' },
      { text: '  Person(x) - "x is a person"', cls: '' },
      { text: '  Policy(y) - "y is a policy"', cls: '' },
      { text: '  Buys(x, y) - "x buys y"', cls: '' },
      { text: '  Smart(x) - "x is smart"', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 3: Construct FOL', cls: 'rule-name' },
      { text: '  ForAll x: ForAll y:', cls: '' },
      { text: '    (Person(x) AND Policy(y) AND Buys(x,y)) => Smart(x)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Two ForAll quantifiers for two variables!', cls: 'rule-name' },
      { text: 'Both pair with => (implication)', cls: 'highlight' }
    ]
  },
  {
    eng: "No person buys expensive policy",
    fol: "NOT Exists x: Person(x) AND Buys(x, ExpensivePolicy)",
    parse: [
      { text: '--- English: "No person buys expensive policy" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: "No" = negation of existence', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Form 1 (using NOT Exists):', cls: 'rule-name' },
      { text: '  NOT Exists x: Person(x) AND Buys(x, ExpensivePolicy)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Form 2 (equivalent, using ForAll):', cls: 'rule-name' },
      { text: '  ForAll x: Person(x) => NOT Buys(x, ExpensivePolicy)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'De Morgan for Quantifiers:', cls: 'rule-name' },
      { text: '  NOT Exists x: P(x)  is same as  ForAll x: NOT P(x)', cls: '' },
      { text: '  NOT ForAll x: P(x)  is same as  Exists x: NOT P(x)', cls: '' }
    ]
  },
  {
    eng: "John's father loves everyone",
    fol: "ForAll y: Loves(Father(John), y)",
    parse: [
      { text: '--- English: "John\'s father loves everyone" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: Identify the FUNCTION', cls: 'rule-name' },
      { text: '  "John\'s father" = Father(John) -- this is a FUNCTION, not a predicate!', cls: '' },
      { text: '  Functions RETURN objects. Father(John) returns the person who is John\'s father.', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 2: "loves everyone" = ForAll quantifier', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 3: Construct FOL', cls: 'rule-name' },
      { text: '  ForAll y: Loves(Father(John), y)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Key Distinction:', cls: 'rule-name' },
      { text: '  Father(John) = FUNCTION (returns an object)', cls: '' },
      { text: '  Loves(x, y)  = PREDICATE (returns true/false)', cls: '' },
      { text: '', cls: '' },
      { text: 'Functions vs Predicates: This is commonly asked in exams!', cls: 'neg' }
    ]
  },
  {
    eng: "All students who study pass the exam",
    fol: "ForAll x: (Student(x) AND Studies(x)) => Passes(x)",
    parse: [
      { text: '--- English: "All students who study pass the exam" ---', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 1: "All ... who ..." = ForAll with compound condition', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 2: Define predicates', cls: 'rule-name' },
      { text: '  Student(x) - "x is a student"', cls: '' },
      { text: '  Studies(x) - "x studies"', cls: '' },
      { text: '  Passes(x)  - "x passes the exam"', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 3: Construct FOL', cls: 'rule-name' },
      { text: '  ForAll x: (Student(x) AND Studies(x)) => Passes(x)', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'The condition has TWO parts joined by AND', cls: '' },
      { text: 'ForAll pairs with => (the outer connective)', cls: 'highlight' }
    ]
  }
];

function showFOLEx(idx, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  var ex = folExamples[idx];
  var area = document.getElementById('folExArea');
  area.textContent = '';

  // FOL formula card
  var card = document.createElement('div');
  card.className = 'playground';
  card.style.borderLeftColor = 'var(--info)';
  card.style.marginBottom = '1rem';

  var title = document.createElement('strong');
  title.textContent = 'English: ' + ex.eng;
  title.style.color = 'var(--info)';
  card.appendChild(title);

  card.appendChild(document.createElement('br'));

  var formula = document.createElement('strong');
  formula.textContent = 'FOL: ' + ex.fol;
  formula.style.color = 'var(--success)';
  formula.style.fontFamily = 'var(--mono)';
  card.appendChild(formula);

  area.appendChild(card);

  // Parse steps
  var result = document.createElement('div');
  result.className = 'result';
  area.appendChild(result);

  ex.parse.forEach(function(step) {
    result.appendChild(makeStep(step.text, step.cls || ''));
  });
}

// ==================== RESOLUTION DEMOS ====================
var resolutionDemos = [
  {
    name: "Rahul Studies -> Passes",
    steps: [
      { text: '=== Resolution Proof: Prove "Rahul passes" ===', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Knowledge Base:', cls: 'rule-name' },
      { text: '  S1: S => P     (If studies, then passes)', cls: '' },
      { text: '  S2: S          (Rahul studies)', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 1: NEGATE the goal', cls: 'rule-name' },
      { text: '  Goal: P (Rahul passes)', cls: '' },
      { text: '  Add: ~P (assume Rahul does NOT pass)', cls: 'neg' },
      { text: '', cls: '' },
      { text: 'Step 2: Convert to CNF', cls: 'rule-name' },
      { text: '  C1: ~S v P     (S => P becomes ~S v P)', cls: '' },
      { text: '  C2: S          (already in CNF)', cls: '' },
      { text: '  C3: ~P         (negation of goal)', cls: 'neg' },
      { text: '', cls: '' },
      { text: 'Step 3: Resolve!', cls: 'rule-name' },
      { text: '  Resolve C1 (~S v P) with C3 (~P) on P:', cls: '' },
      { text: '    P and ~P cancel out!', cls: 'neg' },
      { text: '    Result C4: ~S', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '  Resolve C4 (~S) with C2 (S) on S:', cls: '' },
      { text: '    S and ~S cancel out!', cls: 'neg' },
      { text: '    Result: {} EMPTY CLAUSE!', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'EMPTY CLAUSE = CONTRADICTION!', cls: 'highlight' },
      { text: 'Our assumption (~P) was wrong.', cls: '' },
      { text: 'Therefore P is TRUE: "Rahul passes"', cls: 'highlight' }
    ]
  },
  {
    name: "Rain -> Road Slippery",
    steps: [
      { text: '=== Resolution Proof: Prove "Road is slippery" ===', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'KB: P => Q, Q => R, P    Goal: R', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 1: Add ~R (negate goal)', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 2: Convert to CNF', cls: 'rule-name' },
      { text: '  C1: ~P v Q     (P => Q)', cls: '' },
      { text: '  C2: ~Q v R     (Q => R)', cls: '' },
      { text: '  C3: P', cls: '' },
      { text: '  C4: ~R         (negation)', cls: 'neg' },
      { text: '', cls: '' },
      { text: 'Step 3: Resolve', cls: 'rule-name' },
      { text: '  Resolve C2 (~Q v R) with C4 (~R) on R:', cls: '' },
      { text: '    R and ~R cancel => C5: ~Q', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '  Resolve C1 (~P v Q) with C5 (~Q) on Q:', cls: '' },
      { text: '    Q and ~Q cancel => C6: ~P', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '  Resolve C3 (P) with C6 (~P) on P:', cls: '' },
      { text: '    P and ~P cancel => {} EMPTY CLAUSE!', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: R is TRUE. "Road is slippery"', cls: 'highlight' }
    ]
  },
  {
    name: "John is Smart",
    steps: [
      { text: '=== Resolution Proof: Prove "John is smart" ===', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'KB: S v M (Student OR Smart), ~S (NOT student)', cls: '' },
      { text: 'Goal: M (John is smart)', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 1: Add ~M (negate goal)', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'CNF Clauses:', cls: 'rule-name' },
      { text: '  C1: S v M', cls: '' },
      { text: '  C2: ~S', cls: '' },
      { text: '  C3: ~M         (negation of goal)', cls: 'neg' },
      { text: '', cls: '' },
      { text: 'Resolve C1 (S v M) with C2 (~S) on S:', cls: '' },
      { text: '  S and ~S cancel => C4: M', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'Resolve C4 (M) with C3 (~M) on M:', cls: '' },
      { text: '  M and ~M cancel => {} EMPTY CLAUSE!', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: M is TRUE. "John IS smart"', cls: 'highlight' }
    ]
  },
  {
    name: "West is Criminal",
    steps: [
      { text: '=== Resolution Proof: Prove "West is criminal" ===', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'KB:', cls: '' },
      { text: '  S1: A (West is American)', cls: '' },
      { text: '  S2: E (Nono is enemy)', cls: '' },
      { text: '  S3: S (West sold missiles)', cls: '' },
      { text: '  S4: (A AND E AND S AND W) => C', cls: '' },
      { text: '  S5: W (Missiles are weapons)', cls: '' },
      { text: '', cls: '' },
      { text: 'Step 1: Add ~C (negate goal)', cls: 'rule-name' },
      { text: '', cls: '' },
      { text: 'Step 2: Convert S4 to CNF', cls: 'rule-name' },
      { text: '  (A AND E AND S AND W) => C', cls: '' },
      { text: '  = NOT(A AND E AND S AND W) OR C', cls: '' },
      { text: '  = ~A v ~E v ~S v ~W v C', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'All CNF Clauses:', cls: 'rule-name' },
      { text: '  C1: A', cls: '' },
      { text: '  C2: E', cls: '' },
      { text: '  C3: S', cls: '' },
      { text: '  C4: W', cls: '' },
      { text: '  C5: ~A v ~E v ~S v ~W v C', cls: '' },
      { text: '  C6: ~C (negation of goal)', cls: 'neg' },
      { text: '', cls: '' },
      { text: 'Step 3: Resolve', cls: 'rule-name' },
      { text: '  C5 + C6 on C: ~A v ~E v ~S v ~W => C7', cls: '' },
      { text: '  C7 + C1 on A: ~E v ~S v ~W => C8', cls: '' },
      { text: '  C8 + C2 on E: ~S v ~W => C9', cls: '' },
      { text: '  C9 + C3 on S: ~W => C10', cls: '' },
      { text: '  C10 + C4 on W: {} EMPTY CLAUSE!', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'PROVED: C is TRUE. "West IS a criminal"', cls: 'highlight' }
    ]
  }
];

function showResolution(idx, el) {
  el.parentElement.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  clearAndAppendSteps('resolutionResult', resolutionDemos[idx].steps, 200);
}

// ==================== CUSTOM RESOLUTION ====================
function runResolution() {
  var clauseText = document.getElementById('resInput').value.trim();
  var goal = document.getElementById('resGoal').value.trim();
  var result = document.getElementById('resCustomResult');
  result.style.display = 'block';
  result.textContent = '';

  if (!clauseText || !goal) {
    result.appendChild(makeStep('Please enter clauses and a goal.', 'neg'));
    return;
  }

  var lines = clauseText.split('\n').filter(function(l) { return l.trim(); });
  var steps = [];
  steps.push({ text: '=== Custom Resolution Proof ===', cls: 'rule-name' });
  steps.push({ text: '', cls: '' });
  steps.push({ text: 'Given Clauses:', cls: 'rule-name' });
  lines.forEach(function(l, i) {
    steps.push({ text: '  C' + (i+1) + ': ' + l.trim(), cls: '' });
  });
  steps.push({ text: '', cls: '' });
  steps.push({ text: 'Goal to prove: ' + goal, cls: 'highlight' });
  steps.push({ text: 'Add negation: ~' + goal, cls: 'neg' });
  steps.push({ text: '', cls: '' });

  // Simple resolution engine
  var clauses = lines.map(function(l) {
    return l.trim().split(/\s*v\s*/).map(function(lit) { return lit.trim(); });
  });
  clauses.push(['~' + goal]);

  steps.push({ text: 'All clauses (including negation):', cls: 'rule-name' });
  clauses.forEach(function(c, i) {
    steps.push({ text: '  C' + (i+1) + ': ' + c.join(' v '), cls: '' });
  });
  steps.push({ text: '', cls: '' });

  // Try to resolve
  var found = false;
  var maxIter = 20;
  var iter = 0;
  var newIdx = clauses.length + 1;

  outer:
  for (var i = 0; i < clauses.length && iter < maxIter; i++) {
    for (var j = i + 1; j < clauses.length && iter < maxIter; j++) {
      iter++;
      for (var li = 0; li < clauses[i].length; li++) {
        var lit = clauses[i][li];
        var neg = lit.charAt(0) === '~' ? lit.substring(1) : '~' + lit;
        var negIdx = clauses[j].indexOf(neg);
        if (negIdx !== -1) {
          var remaining = [];
          clauses[i].forEach(function(l, idx) { if (idx !== li) remaining.push(l); });
          clauses[j].forEach(function(l, idx) { if (idx !== negIdx) remaining.push(l); });
          // Remove duplicates
          remaining = remaining.filter(function(v, idx, a) { return a.indexOf(v) === idx; });

          steps.push({ text: 'Resolve C' + (i+1) + ' with C' + (j+1) + ' on ' + lit.replace('~','') + ':', cls: 'rule-name' });
          steps.push({ text: '  ' + clauses[i].join(' v ') + '  +  ' + clauses[j].join(' v '), cls: '' });

          if (remaining.length === 0) {
            steps.push({ text: '  Result: {} EMPTY CLAUSE!', cls: 'highlight' });
            steps.push({ text: '', cls: '' });
            steps.push({ text: 'CONTRADICTION! ' + goal + ' is PROVED!', cls: 'highlight' });
            found = true;
            break outer;
          } else {
            steps.push({ text: '  Result C' + newIdx + ': ' + remaining.join(' v '), cls: 'highlight' });
            clauses.push(remaining);
            newIdx++;
          }
          steps.push({ text: '', cls: '' });
          break;
        }
      }
    }
  }

  if (!found) {
    steps.push({ text: 'Could not derive empty clause with simple resolution.', cls: 'neg' });
    steps.push({ text: 'Try different clauses or check the input format.', cls: '' });
  }

  setStepsImmediate('resCustomResult', steps);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize PL vs FOL
  var plPill = document.querySelector('#plfolPills .pill');
  if (plPill) showPLFOL(0, plPill);

  // Initialize truth table - find the pill container in plvsfol section near truthTableArea
  var ttPills = document.getElementById('truthTableArea');
  if (ttPills) {
    var ttContainer = ttPills.previousElementSibling;
    if (ttContainer && ttContainer.classList.contains('example-pills')) {
      var firstTTPill = ttContainer.querySelector('.pill');
      if (firstTTPill) showTruthTable('not', firstTTPill);
    }
  }

  // Initialize inference rules
  var firstRuleCard = document.querySelector('.rule-card');
  if (firstRuleCard) selectRule('mp', firstRuleCard);

  // Initialize chain proofs - find the pill container in inference section
  var chainResult = document.getElementById('chainResult');
  if (chainResult) {
    var chainPills = chainResult.previousElementSibling;
    if (chainPills && chainPills.classList.contains('example-pills')) {
      var firstChainPill = chainPills.querySelector('.pill');
      if (firstChainPill) showChainProof(0, firstChainPill);
    }
  }

  // Initialize FOL examples
  var folExPill = document.querySelector('#folExPills .pill');
  if (folExPill) showFOLEx(0, folExPill);

  // Initialize resolution
  var resResult = document.getElementById('resolutionResult');
  if (resResult) {
    var resPills = resResult.previousElementSibling;
    if (resPills && resPills.classList.contains('example-pills')) {
      var firstResPill = resPills.querySelector('.pill');
      if (firstResPill) showResolution(0, firstResPill);
    }
  }

  // Restore any in-progress test session
  restoreTestSession();
});

// ==================== TEST MODULE ====================
// 15 MCQs drawn directly from FOL_Theorem_Proving_Made_Simple.md
// Covers: PL vs FOL, vocabulary, quantifiers, golden pairing,
// easy/medium/hard translations, De Morgan, CNF equivalence,
// unification, inference rules, and the West-is-Criminal proof.

var TEST_QUESTIONS = [
  {
    q: "Why was First-Order Logic (FOL) developed as an extension of Propositional Logic (PL)?",
    options: [
      "PL uses more memory than FOL",
      "PL cannot talk about objects, properties, relations, or general rules like \"all students\"",
      "FOL is faster to compute on modern hardware",
      "FOL removes the need for logical connectives"
    ],
    answer: 1,
    explain: "PL treats each fact as a black box (P, Q, R). FOL adds objects, predicates, functions, and quantifiers so ONE sentence can cover infinitely many cases. (Notes §1)"
  },
  {
    q: "In the FOL expression Loves(John, Mary), what is 'John'?",
    options: [
      "A variable",
      "A predicate",
      "A constant",
      "A function"
    ],
    answer: 2,
    explain: "'John' names one specific object in the world, so it is a constant. Constants start with a CapitalLetter. (Notes §2, Block 1)"
  },
  {
    q: "What is the KEY difference between a predicate and a function in FOL?",
    options: [
      "Predicates use uppercase, functions use lowercase",
      "A predicate returns True or False; a function returns an object",
      "Predicates take one argument; functions take many arguments",
      "There is no difference — they are the same thing"
    ],
    answer: 1,
    explain: "Student(John) is a predicate — asks a yes/no question. Father(John) is a function — returns the person who is John's father. (Notes §2, Block 4)"
  },
  {
    q: "In FOL, the universal quantifier ∀ is almost always paired with which connective?",
    options: [
      "∧ (AND)",
      "∨ (OR)",
      "⇒ (IMPLIES)",
      "⇔ (IF AND ONLY IF)"
    ],
    answer: 2,
    explain: "\"All birds fly\" → ∀x: Bird(x) ⇒ Fly(x). Pairing ∀ with ∧ would claim EVERYTHING in the universe is both a bird and flies. (Notes §4, Golden Rule)"
  },
  {
    q: "In FOL, the existential quantifier ∃ is almost always paired with which connective?",
    options: [
      "⇒ (IMPLIES)",
      "∧ (AND)",
      "⇔ (IF AND ONLY IF)",
      "¬ (NOT)"
    ],
    answer: 1,
    explain: "\"Some birds are blue\" → ∃x: Bird(x) ∧ Blue(x). Pairing ∃ with ⇒ gives vacuous truth (true even for rocks) and says nothing useful. (Notes §4, Golden Rule)"
  },
  {
    q: "Which is the correct FOL translation of \"All dogs bark\"?",
    options: [
      "∃x: Dog(x) ∧ Bark(x)",
      "∀x: Dog(x) ∧ Bark(x)",
      "∀x: Dog(x) ⇒ Bark(x)",
      "∀x: Bark(x) ⇒ Dog(x)"
    ],
    answer: 2,
    explain: "\"All\" → ∀, which pairs with ⇒. Read: \"For every x, if x is a dog, then x barks.\" (Notes §7, Medium)"
  },
  {
    q: "Which is the correct FOL translation of \"Some students are lazy\"?",
    options: [
      "∀x: Student(x) ⇒ Lazy(x)",
      "∃x: Student(x) ∧ Lazy(x)",
      "∃x: Student(x) ⇒ Lazy(x)",
      "∀x: Student(x) ∧ Lazy(x)"
    ],
    answer: 1,
    explain: "\"Some\" → ∃, which pairs with ∧. Read: \"There exists some x such that x is a student AND x is lazy.\" (Notes §7, Medium)"
  },
  {
    q: "Which is a correct FOL translation of \"No fish can fly\"?",
    options: [
      "∃x: Fish(x) ∧ CanFly(x)",
      "∀x: Fish(x) ∧ ¬CanFly(x)",
      "¬∃x: Fish(x) ∧ CanFly(x)",
      "∃x: Fish(x) ⇒ ¬CanFly(x)"
    ],
    answer: 2,
    explain: "\"No\" = negation of exists. Equivalent form: ∀x: Fish(x) ⇒ ¬CanFly(x). This uses De Morgan for quantifiers. (Notes §7, §16)"
  },
  {
    q: "Which is the correct FOL translation of \"Every student has a teacher\"?",
    options: [
      "∃y ∀x: Teacher(y) ∧ Teaches(y, x)",
      "∀x: Student(x) ⇒ ∃y: Teacher(y) ∧ Teaches(y, x)",
      "∀x ∀y: Student(x) ∧ Teacher(y) ⇒ Teaches(y, x)",
      "∃x ∃y: Student(x) ∧ Teacher(y) ∧ Teaches(y, x)"
    ],
    answer: 1,
    explain: "Every student (∀ with ⇒) has SOME teacher (∃ with ∧). Order matters — different students can have different teachers. Option A would mean ONE teacher teaches everyone. (Notes §7, Hard)"
  },
  {
    q: "Which FOL expression best captures \"Everyone loves their mother\" using a function?",
    options: [
      "∀x: Person(x) ⇒ Loves(x, Mother(x))",
      "∀x ∀y: Person(x) ∧ Mother(y, x) ⇒ Loves(x, y)",
      "∃x: Person(x) ∧ Loves(x, Mother)",
      "∀x: Loves(x, Mother)"
    ],
    answer: 0,
    explain: "Each person has exactly ONE mother, so Mother(x) is a function that returns the mother object directly. This is where functions shine. (Notes §7, Hard)"
  },
  {
    q: "Which of the following is equivalent to ¬∀x P(x)?",
    options: [
      "∀x ¬P(x)",
      "∃x ¬P(x)",
      "¬∃x P(x)",
      "∀x P(x)"
    ],
    answer: 1,
    explain: "De Morgan for quantifiers: \"It is not the case that all have P\" = \"At least one does not have P\" = ∃x ¬P(x). (Notes §16)"
  },
  {
    q: "The implication A ⇒ B is logically equivalent to:",
    options: [
      "A ∧ B",
      "¬A ∧ B",
      "¬A ∨ B",
      "A ∨ ¬B"
    ],
    answer: 2,
    explain: "This is THE must-know equivalence — used in every CNF conversion. \"A implies B\" = \"either A is false, or B is true.\" (Notes §13 Step 2, §16)"
  },
  {
    q: "What is the Most General Unifier for Likes(x, Cricket) and Likes(John, Cricket)?",
    options: [
      "{x/Cricket}",
      "{x/John}",
      "{John/x}",
      "They cannot be unified"
    ],
    answer: 1,
    explain: "Substitute the variable x with the constant John. The second arguments (Cricket, Cricket) already match. Notation {x/John} reads as \"x is replaced by John.\" (Notes §10)"
  },
  {
    q: "Given A ⇒ B and A, which inference rule lets you conclude B?",
    options: [
      "Modus Tollens",
      "Modus Ponens",
      "Resolution",
      "And-Elimination"
    ],
    answer: 1,
    explain: "Modus Ponens: from \"A implies B\" and \"A is true,\" conclude \"B is true.\" Modus Tollens instead uses ¬B to conclude ¬A. (Notes §11)"
  },
  {
    q: "In the classic \"West is Criminal\" theorem-proving exercise, what statement is the GOAL being proved from the knowledge base?",
    options: [
      "American(West)",
      "Hostile(Nono)",
      "Criminal(West)",
      "Missile(M1)"
    ],
    answer: 2,
    explain: "The goal is Criminal(West). Options A, B, D are facts/sub-goals used during the proof. The final derivation applies the rule: American ∧ Weapon ∧ Sells ∧ Hostile ⇒ Criminal. (Notes §15)"
  }
];

var LS_SESSION = 'fol_test_session_v1';
var LS_ATTEMPTS = 'fol_test_attempts_v1';

var testState = {
  student: null,      // {rollNo, name, loginAt}
  currentQ: 0,
  answers: new Array(TEST_QUESTIONS.length).fill(null),
  submitted: false
};

// ---- DOM helpers (safe clearing) ----
function clearEl(el) {
  while (el && el.firstChild) el.removeChild(el.firstChild);
}

// ---- Screen switching (internal to the Test section) ----
function showTestScreen(name) {
  ['login', 'quiz', 'result'].forEach(function(s) {
    var el = document.getElementById('test-screen-' + s);
    if (el) el.classList.toggle('active', s === name);
  });
  window.scrollTo(0, 0);
}

// ---- Login ----
function handleTestLogin() {
  var rollNo = (document.getElementById('loginRollNo').value || '').trim();
  var name = (document.getElementById('loginName').value || '').trim();
  var password = document.getElementById('loginPassword').value || '';
  var errorEl = document.getElementById('loginError');

  function showErr(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  if (!rollNo || !name || !password) {
    showErr('All fields are required.');
    return;
  }
  if (password !== 'abcd') {
    showErr('Invalid password. The default password is "abcd".');
    return;
  }

  errorEl.style.display = 'none';
  testState.student = { rollNo: rollNo, name: name, loginAt: new Date().toISOString() };
  testState.currentQ = 0;
  testState.answers = new Array(TEST_QUESTIONS.length).fill(null);
  testState.submitted = false;

  try { localStorage.setItem(LS_SESSION, JSON.stringify(testState)); } catch (e) {}

  startQuiz();
}

function startQuiz() {
  document.getElementById('quizTotalNum').textContent = TEST_QUESTIONS.length;
  var studentEl = document.getElementById('quizStudent');
  clearEl(studentEl);
  var strongEl = document.createElement('strong');
  strongEl.textContent = testState.student.name;
  studentEl.appendChild(strongEl);
  studentEl.appendChild(document.createTextNode(' · Roll ' + testState.student.rollNo));
  document.getElementById('quizOverview').style.display = 'none';
  renderTestQuestion();
  showTestScreen('quiz');
}

// ---- Render current question ----
function renderTestQuestion() {
  var i = testState.currentQ;
  var q = TEST_QUESTIONS[i];
  document.getElementById('quizCurrentNum').textContent = (i + 1);
  document.getElementById('quizQuestionText').textContent = (i + 1) + '. ' + q.q;

  var fillPct = ((i + 1) / TEST_QUESTIONS.length) * 100;
  document.getElementById('quizProgressFill').style.width = fillPct + '%';

  var optsContainer = document.getElementById('quizOptions');
  clearEl(optsContainer);
  var letters = ['A', 'B', 'C', 'D'];
  q.options.forEach(function(optText, optIdx) {
    var optBtn = document.createElement('div');
    optBtn.className = 'quiz-option';
    if (testState.answers[i] === optIdx) optBtn.classList.add('selected');
    optBtn.onclick = function() { selectTestOption(optIdx); };

    var letter = document.createElement('div');
    letter.className = 'opt-letter';
    letter.textContent = letters[optIdx];

    var text = document.createElement('div');
    text.className = 'opt-text';
    text.textContent = optText;

    optBtn.appendChild(letter);
    optBtn.appendChild(text);
    optsContainer.appendChild(optBtn);
  });

  document.getElementById('quizPrevBtn').disabled = (i === 0);
  var nextBtn = document.getElementById('quizNextBtn');
  if (i === TEST_QUESTIONS.length - 1) {
    nextBtn.textContent = 'Review →';
  } else {
    nextBtn.textContent = 'Next →';
  }
}

function selectTestOption(optIdx) {
  testState.answers[testState.currentQ] = optIdx;
  try { localStorage.setItem(LS_SESSION, JSON.stringify(testState)); } catch (e) {}
  renderTestQuestion();
}

function nextTestQuestion() {
  if (testState.currentQ < TEST_QUESTIONS.length - 1) {
    testState.currentQ++;
    renderTestQuestion();
  } else {
    showQuizOverview();
  }
}

function prevTestQuestion() {
  if (testState.currentQ > 0) {
    testState.currentQ--;
    renderTestQuestion();
  }
}

function showQuizOverview() {
  var grid = document.getElementById('quizOverviewGrid');
  clearEl(grid);
  for (var i = 0; i < TEST_QUESTIONS.length; i++) {
    (function(idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = (idx + 1);
      if (testState.answers[idx] !== null) btn.classList.add('answered');
      if (idx === testState.currentQ) btn.classList.add('current');
      btn.onclick = function() {
        testState.currentQ = idx;
        document.getElementById('quizOverview').style.display = 'none';
        renderTestQuestion();
      };
      grid.appendChild(btn);
    })(i);
  }
  document.getElementById('quizOverview').style.display = 'block';
  document.getElementById('quizOverview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Submit & Result ----
function submitTest() {
  var unanswered = testState.answers.filter(function(a) { return a === null; }).length;
  if (unanswered > 0) {
    var ok = confirm('You have ' + unanswered + ' unanswered question(s). Submit anyway?');
    if (!ok) return;
  } else {
    var ok2 = confirm('Submit your test? You will not be able to change answers after this.');
    if (!ok2) return;
  }

  testState.submitted = true;

  // Compute score
  var correct = 0, wrong = 0, skipped = 0;
  testState.answers.forEach(function(a, i) {
    if (a === null) skipped++;
    else if (a === TEST_QUESTIONS[i].answer) correct++;
    else wrong++;
  });

  var attempt = {
    rollNo: testState.student.rollNo,
    name: testState.student.name,
    score: correct,
    total: TEST_QUESTIONS.length,
    correct: correct,
    wrong: wrong,
    skipped: skipped,
    answers: testState.answers.slice(),
    submittedAt: new Date().toISOString()
  };
  try {
    var arr = JSON.parse(localStorage.getItem(LS_ATTEMPTS) || '[]');
    arr.push(attempt);
    localStorage.setItem(LS_ATTEMPTS, JSON.stringify(arr));
  } catch (e) {}

  renderTestResult(correct, wrong, skipped);
  showTestScreen('result');
}

function renderTestResult(correct, wrong, skipped) {
  var total = TEST_QUESTIONS.length;
  var pct = Math.round((correct / total) * 100);
  var passed = pct >= 60;

  var studentEl = document.getElementById('resultStudent');
  clearEl(studentEl);
  studentEl.appendChild(document.createTextNode('Student: '));
  var sName = document.createElement('strong');
  sName.textContent = testState.student.name;
  studentEl.appendChild(sName);
  studentEl.appendChild(document.createTextNode(' · Roll ' + testState.student.rollNo));

  var badge = document.getElementById('scoreBadge');
  badge.textContent = correct + ' / ' + total;
  badge.className = 'score-badge ' + (passed ? 'pass' : 'fail');

  document.getElementById('scoreCorrect').textContent = correct;
  document.getElementById('scoreWrong').textContent = wrong;
  document.getElementById('scoreUnanswered').textContent = skipped;
  document.getElementById('scorePercent').textContent = pct + '% · ' + (passed ? 'PASS ✓' : 'FAIL ✗');

  var breakdown = document.getElementById('resultBreakdown');
  clearEl(breakdown);
  var letters = ['A', 'B', 'C', 'D'];

  TEST_QUESTIONS.forEach(function(q, i) {
    var user = testState.answers[i];
    var isCorrect = (user !== null && user === q.answer);
    var isSkipped = (user === null);

    var item = document.createElement('div');
    item.className = 'review-item ' + (isSkipped ? 'skipped' : (isCorrect ? 'correct' : 'wrong'));

    var qRow = document.createElement('div');
    qRow.className = 'review-q';
    var badgeEl = document.createElement('span');
    badgeEl.className = 'review-badge ' + (isSkipped ? 'sk' : (isCorrect ? 'ok' : 'ng'));
    badgeEl.textContent = isSkipped ? '◯' : (isCorrect ? '✓' : '✗');
    qRow.appendChild(badgeEl);
    var qText = document.createElement('span');
    qText.textContent = 'Q' + (i + 1) + '. ' + q.q;
    qRow.appendChild(qText);
    item.appendChild(qRow);

    var userRow = document.createElement('div');
    userRow.className = 'review-answer-row user';
    var userLabel = document.createElement('span');
    userLabel.className = 'label';
    userLabel.textContent = 'Your answer:';
    userRow.appendChild(userLabel);
    var userAns = document.createElement('span');
    userAns.className = 'answer-text';
    userAns.textContent = isSkipped ? '(not answered)' : (letters[user] + '. ' + q.options[user]);
    userRow.appendChild(userAns);
    item.appendChild(userRow);

    if (!isCorrect) {
      var corrRow = document.createElement('div');
      corrRow.className = 'review-answer-row correct-ans';
      var corrLabel = document.createElement('span');
      corrLabel.className = 'label';
      corrLabel.textContent = 'Correct:';
      corrRow.appendChild(corrLabel);
      var corrAns = document.createElement('span');
      corrAns.className = 'answer-text';
      corrAns.textContent = letters[q.answer] + '. ' + q.options[q.answer];
      corrRow.appendChild(corrAns);
      item.appendChild(corrRow);
    }

    var explain = document.createElement('div');
    explain.className = 'review-explain';
    explain.textContent = q.explain;
    item.appendChild(explain);

    breakdown.appendChild(item);
  });
}

function retakeTest() {
  if (!confirm('Reset your answers and retake the test?')) return;
  testState.currentQ = 0;
  testState.answers = new Array(TEST_QUESTIONS.length).fill(null);
  testState.submitted = false;
  try { localStorage.setItem(LS_SESSION, JSON.stringify(testState)); } catch (e) {}
  startQuiz();
}

function logoutTest() {
  testState.student = null;
  testState.currentQ = 0;
  testState.answers = new Array(TEST_QUESTIONS.length).fill(null);
  testState.submitted = false;
  try { localStorage.removeItem(LS_SESSION); } catch (e) {}
  document.getElementById('loginRollNo').value = '';
  document.getElementById('loginName').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').style.display = 'none';
  showTestScreen('login');
}

function restoreTestSession() {
  try {
    var raw = localStorage.getItem(LS_SESSION);
    if (!raw) return;
    var saved = JSON.parse(raw);
    if (!saved || !saved.student) return;
    // Migration guard: if saved answers length doesn't match current test, reset
    if (!Array.isArray(saved.answers) || saved.answers.length !== TEST_QUESTIONS.length) {
      localStorage.removeItem(LS_SESSION);
      return;
    }
    testState = saved;
    if (testState.submitted) {
      var correct = 0, wrong = 0, skipped = 0;
      testState.answers.forEach(function(a, i) {
        if (a === null) skipped++;
        else if (a === TEST_QUESTIONS[i].answer) correct++;
        else wrong++;
      });
      renderTestResult(correct, wrong, skipped);
      showTestScreen('result');
    } else {
      startQuiz();
    }
  } catch (e) {
    try { localStorage.removeItem(LS_SESSION); } catch (e2) {}
  }
}
