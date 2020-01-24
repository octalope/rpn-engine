const {expect} = require('chai');


const endInput = (priorEngine) => {
  priorEngine.stack.unshift(Number(priorEngine.edit));
  delete priorEngine.edit;
  return priorEngine;
};

const minStack = (n) => (priorEngine) => {
  if (priorEngine.stack.length < n) {
    return {
      ...priorEngine,
      error: 'TooFewArguments'
    };
  }
  return priorEngine;
};

const add = (priorEngine) => {
  const x = priorEngine.stack.shift();
  const y = priorEngine.stack.shift();
  priorEngine.stack.unshift(x + y);
  return priorEngine;
};

const doOperations = (priorEngine, arr) => {
  let lastEngine = priorEngine;
  arr.forEach(item => {
    lastEngine = item(lastEngine);
  });
  return lastEngine;
};


describe.skip('scratch', () => {
  it('composes', () => {
    let engine = {
      stack: [2],
      edit: '1'
    };

    let priorEngine = doOperations(engine, [
      endInput,
      minStack(2),
      add
    ]);

    expect(priorEngine).to.deep.equal({
      stack: [3]
    })

  });
});
