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


// ========================================================
//  Actions
// ========================================================

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

const executeUnaryOperation = (operation) => {
  return {
    type: 'UNARY_OPERATION',
    payload: operation
  };
};

const executeBinaryOperation = (operation) => {
  return {
    type: 'BINARY_OPERATION',
    payload: operation
  };
};

// ========================================================
//  Reducers
// ========================================================

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

// Unary Operations

const UnaryOperations = {
  Sin: 'SIN',
};

const processUnaryOperation = (priorEngine, action) => {
  const exec = (prior, func) => {
    if (prior.stack.length > 0) {
      const newStack = prior.stack.slice();
      const x = newStack.shift();
      newStack.unshift(func(x));
      return {
        stack: newStack
      };
    } else {
      return {
        ...priorEngine,
        error: 'TooFewArguments'
      };
    }
  };

  switch (action.payload) {
    case UnaryOperations.Sin:
      return exec(endInput(priorEngine), (x) => Math.sin(x));
  }
  return priorEngine;
};

// Binary Operations

const BinaryOperations = {
  Add: 'ADD',
  Divide: 'DIVIDE',
  Multiply: 'MULTIPLY',
  Subtract: 'SUBTRACT'
};

const processBinaryOperation = (priorEngine, action) => {
  const exec = (prior, func) => {
    if (prior.stack.length > 1) {
      const newStack = prior.stack.slice();
      const x = newStack.shift();
      const y = newStack.shift();
      newStack.unshift(func(x, y));
      return {
        stack: newStack
      };
    } else {
      return {
        ...priorEngine,
        error: 'TooFewArguments'
      };
    }
  };

  switch (action.payload) {
    case BinaryOperations.Add:
      return exec(endInput(priorEngine), (x, y) => x + y);
    case BinaryOperations.Divide: {
      const priorEngineEndEdit = endInput(priorEngine);
      if (priorEngineEndEdit.stack.length > 0 && Number(priorEngineEndEdit.stack[0]) === 0) {
        return {
          ...priorEngineEndEdit,
          error: 'InfiniteResult'
        };
      }
      return exec(priorEngineEndEdit, (x, y) => y / x);
    }
    case BinaryOperations.Multiply:
      return exec(endInput(priorEngine), (x, y) => x * y);
    case BinaryOperations.Subtract:
      return exec(endInput(priorEngine), (x, y) => y - x);
  }
};

const engine = (priorEngine = INITIAL_ENGINE, action) => {
  if (action.type === 'INPUT_OPERATION') {
    return processInputOperation(priorEngine, action);
  }

  if (action.type === 'STACK_OPERATION') {
    return processStackOperation(priorEngine, action);
  }

  if (action.type === 'UNARY_OPERATION') {
    return processUnaryOperation(priorEngine, action);
  }

  if (action.type === 'BINARY_OPERATION') {
    return processBinaryOperation(priorEngine, action);
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

const UnaryOperation = {
  sin: () => dispatch(executeUnaryOperation(UnaryOperations.Sin)),
};

const BinaryOperation = {
  add: () => dispatch(executeBinaryOperation(BinaryOperations.Add)),
  divide: () => dispatch(executeBinaryOperation(BinaryOperations.Divide)),
  multiply: () => dispatch(executeBinaryOperation(BinaryOperations.Multiply)),
  subtract: () => dispatch(executeBinaryOperation(BinaryOperations.Subtract)),
};

module.exports = {
  Input,
  Stack,
  UnaryOperation,
  BinaryOperation,
  state
};
