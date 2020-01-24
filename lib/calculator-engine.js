const { combineReducers, createStore } = require('redux');

const INITIAL_ENGINE = {
  stack: [],
  edit: null
};

const isEditing = (priorEngine) => (typeof priorEngine.edit === 'string' || priorEngine.edit instanceof String);
const isStackEmpty = (priorEngine) => priorEngine.stack.length === 0;
const endInput = (priorEngine) => {
  if (isEditing(priorEngine) && priorEngine.edit.length > 0) {
    priorEngine.stack.unshift(Number(priorEngine.edit));
    delete priorEngine.edit;
  }
  return priorEngine;
};
const hasError = (priorEngine) => priorEngine.hasOwnProperty('error');

// ========================================================
//  Actions
// ========================================================

const minArgs = (n) => {
  return {
    type: 'INPUT_VALIDATION',
    payload: {
      validationType: 'MIN_ARGS',
      minArgs: n
    }
  };
};

const isNonZeroRegister = (reg) => {
  return {
    type: 'INPUT_VALIDATION',
    payload: {
      validationType: 'NON_ZERO_REGISTER',
      register: 0
    }
  };
};

const executeInputOperation = (payload) => {
  return {
    type: 'INPUT_OPERATION',
    payload
  };
};

const executeStackOperation = (operation) => {
  return {
    type: 'STACK_OPERATION',
    payload: operation
  };
};

const executeOperation = (operation) => {
  return {
    type: 'OPERATION',
    payload: operation
  };
};

// ========================================================
//  Reducers
// ========================================================

// Input Validation

const processInputValidation = (priorEngine, action) => {
  const checkMinArgs = () => {
    if (priorEngine.stack.length < action.payload.minArgs) {
      return {
        ...priorEngine,
        error: 'TooFewArguments'
      };
    }
    return priorEngine;
  };

  const checkNonZeroRegister = () => {
    if (priorEngine.stack[action.payload.register] === 0) {
      return {
        ...priorEngine,
        error: 'InfiniteResult'
      };
    }
    return priorEngine;
  };

  switch (action.payload.validationType) {
    case 'MIN_ARGS':
      return checkMinArgs();
    case 'NON_ZERO_REGISTER':
      return checkNonZeroRegister();
  }
  return priorEngine;
};

// Input Operations

const InputOperations = {
  InsertCharacter: 'INSERT_CHARACTER',
  DeleteCharacter: 'DELETE_CHARACTER',
  ChangeSign: 'CHANGE_SIGN',
};

const processInputOperation = (priorEngine, action) => {
  const insertCharacter = (priorEngine, character) => {
    if (!isEditing(priorEngine)) {
      return {
        stack: priorEngine.stack,
        edit: '' + character
      };
    } else {
      return {
        stack: priorEngine.stack,
        edit: priorEngine.edit + character
      };
    }
  };

  const deleteCharacter = (priorEngine) => {
    if (isEditing(priorEngine) && priorEngine.edit.length > 0) {
      return {
        stack: priorEngine.stack,
        edit: priorEngine.edit.slice(0, -1)
      };
    }
    return priorEngine;
  };

  const changeSign = (priorEngine) => {
    const changeMantissa = () => {
      if (priorEngine.edit[0] === '-') {
        return {
          stack: priorEngine.stack,
          edit: priorEngine.edit.slice(1)
        };
      } else {
        return {
          stack: priorEngine.stack,
          edit: '-' + priorEngine.edit
        };
      }
    };

    const changeExponent = (exponentPosition) => {
      if (priorEngine.edit[exponentPosition + 1] === '-') {
        return {
          stack: priorEngine.stack,
          edit: priorEngine.edit.slice(0, exponentPosition + 1) + '+' + priorEngine.edit.slice(exponentPosition + 2)
        };
      } else if (priorEngine.edit[exponentPosition + 1] === '+') {
        return {
          stack: priorEngine.stack,
          edit: priorEngine.edit.slice(0, exponentPosition + 1) + '-' + priorEngine.edit.slice(exponentPosition + 2)
        };
      } else {
        return {
          stack: priorEngine.stack,
          edit: priorEngine.edit.slice(0, exponentPosition + 1) + '-' + priorEngine.edit.slice(exponentPosition + 1)
        };
      }
    };

    const changeSignOfBottomOfStack = () => {
      priorEngine.stack[0] *= -1;
      return priorEngine;
    };

    if (isEditing(priorEngine) && (priorEngine.edit.length >= 0)) {
      const exponentPositionUpper = priorEngine.edit.indexOf('E');
      const exponentPositionLower = priorEngine.edit.indexOf('e');
      if (-1 === exponentPositionUpper && -1 === exponentPositionLower) {
        return changeMantissa();
      } else if (-1 !== exponentPositionUpper) {
        return changeExponent(exponentPositionUpper);
      } else {
        return changeExponent(exponentPositionLower);
      }
    } else {
      if (!isStackEmpty(priorEngine)) {
        return changeSignOfBottomOfStack();
      } else {
        return {
          ...priorEngine,
          error: 'TooFewArguments'
        };
      }
    }
  };

  switch (action.payload.operation) {
    case InputOperations.InsertCharacter:
      return insertCharacter(priorEngine, action.payload.character);
    case InputOperations.DeleteCharacter:
      return deleteCharacter(priorEngine);
    case InputOperations.ChangeSign:
      return changeSign(priorEngine);
  }
};

// Stack Operations

const StackOperations = {
  Push: 'PUSH',
  ClearStack: 'CLEAR_STACK',
  Drop: 'DROP'
};

const processStackOperation = (priorEngine, action) => {
  const drop = () => {
    if (!isEditing(priorEngine) && isStackEmpty(priorEngine)) {
      return {
        ...priorEngine,
        error: 'TooFewArguments'
      };
    }
    let priorEngineEndEdit = priorEngine;
    if (isEditing(priorEngine)) {
      priorEngineEndEdit = endInput(priorEngine);
    }
    priorEngineEndEdit.stack.shift();
    return priorEngineEndEdit;
  };

  switch (action.payload) {
    case StackOperations.ClearStack:
      return {
        stack: []
      };
    case StackOperations.Push:
      return endInput(priorEngine);
    case StackOperations.Drop:
      return drop();
  }
};

// Operations

const Operations = {
  Add: 'ADD',
  Divide: 'DIVIDE',
  Multiply: 'MULTIPLY',
  Subtract: 'SUBTRACT',
  Sin: 'SIN'
};

const processOperation = (priorEngine, action) => {
  const execOne = (prior, func) => {
    const x = prior.stack.shift();
    prior.stack.unshift(func(x));
    return prior;
  };

  const execTwo = (prior, func) => {
    const x = prior.stack.shift();
    const y = prior.stack.shift();
    prior.stack.unshift(func(x, y));
    return prior;
  };

  switch (action.payload) {
    case Operations.Add:
      return execTwo(priorEngine, (x, y) => x + y);
    case Operations.Divide:
      return execTwo(priorEngine, (x, y) => y / x);
    case Operations.Multiply:
      return execTwo(priorEngine, (x, y) => x * y);
    case Operations.Subtract:
      return execTwo(priorEngine, (x, y) => y - x);
    case Operations.Sin:
      return execOne(priorEngine, (x) => Math.sin(x));
  }
};

const engine = (priorEngine = INITIAL_ENGINE, action) => {
  if (action.type === 'INPUT_VALIDATION') {
    return processInputValidation(endInput(priorEngine), action);
  }

  if (action.type === 'INPUT_OPERATION') {
    return processInputOperation(priorEngine, action);
  }

  if (action.type === 'STACK_OPERATION') {
    return processStackOperation(priorEngine, action);
  }

  if (!hasError(priorEngine) && action.type === 'OPERATION') {
    return processOperation(priorEngine, action);
  }

  return priorEngine;
};

const reducers = combineReducers({
  engine
});

const store = createStore(reducers);

const dispatch = action => {
  store.dispatch(action);
};

const multiDispatch = (...actions) => {
  actions.forEach(action => {
    store.dispatch(action);
  });
};

const state = () => {
  return store.getState().engine;
};

// ========================================================
//  Public Methods and Objects
// ========================================================

const Input = {
  insertCharacter: (numberChar) => dispatch(executeInputOperation({operation: InputOperations.InsertCharacter, character: numberChar})),
  insertNumber: (numberString) => dispatch(executeInputOperation({operation: InputOperations.InsertCharacter, character: numberString})),
  removeCharacter: () => dispatch(executeInputOperation({operation: InputOperations.DeleteCharacter})),
  changeSign: () => dispatch(executeInputOperation({operation: InputOperations.ChangeSign})),
};

const Stack = {
  clear: () => dispatch(executeStackOperation(StackOperations.ClearStack)),
  push: () => dispatch(executeStackOperation(StackOperations.Push)),
  drop: () => dispatch(executeStackOperation(StackOperations.Drop)),
};

const Operation = {
  add: () => multiDispatch(minArgs(2), executeOperation(Operations.Add)),
  divide: () => multiDispatch(minArgs(2), isNonZeroRegister(0), executeOperation(Operations.Divide)),
  multiply: () => multiDispatch(minArgs(2), executeOperation(Operations.Multiply)),
  subtract: () => multiDispatch(minArgs(2), executeOperation(Operations.Subtract)),
  sin: () => multiDispatch(minArgs(1), executeOperation(Operations.Sin)),
};

module.exports = {
  Input,
  Stack,
  Operation,
  state
};
