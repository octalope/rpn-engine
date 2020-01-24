const { expect } = require('chai');

const Calc = require('../index');

describe('calculator-engine', () => {

  const insertNumberString = (numberString) => {
    Calc.Input.insertNumber(numberString);
  };

  const pushNumberString = (numberString) => {
    insertNumberString(numberString);
    Calc.Stack.push();
  };

  beforeEach(() => {
    Calc.Stack.clear();
  });

  afterEach(() => {
    // console.log(Calc.state());
  });

  describe('Input', () => {
    describe('insertCharacter', () => {
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '+', 'E', '.']
        .forEach(character => {
          it(`inserts the character ${JSON.stringify(character)}`, () => {
            Calc.Input.insertCharacter(character);
            expect(Calc.state()).to.deep.equal({
              edit: character,
              stack: []
            });
          });
        });

      [
        String(-Number.MAX_VALUE),
        String(-Number.EPSILON),
        String(-Number.MIN_VALUE),
        String(Number.MIN_VALUE),
        String(0),
        String(Number.EPSILON),
        String(Number.MAX_VALUE),
      ].forEach(character => {
        it(`inserts the characters for ${JSON.stringify(character)}`, () => {
          Calc.Input.insertCharacter(character);
          expect(Calc.state()).to.deep.equal({
            edit: character,
            stack: []
          });
        });
      });
    });

    describe('removeCharacter', () => {
      it('removes a character', () => {
        Calc.Input.insertCharacter(1);
        Calc.Input.removeCharacter();
        expect(Calc.state()).to.deep.equal({
          edit: '',
          stack: []
        });
      });

      it('ignores character removal during edit when the edit is empty', () => {
        Calc.Input.insertCharacter(1);
        expect(Calc.state()).to.deep.equal({
          edit: '1',
          stack: []
        });
        Calc.Input.removeCharacter();
        expect(Calc.state()).to.deep.equal({
          edit: '',
          stack: []
        });
        Calc.Input.removeCharacter();
        expect(Calc.state()).to.deep.equal({
          edit: '',
          stack: []
        });
      });
    });

    describe('changeSign', () => {
      describe('when editing', () => {
        describe('when the number is not in scientific notation', () => {
          it('changes the sign of a positive number', () => {
            insertNumberString('1');
            expect(Calc.state()).to.deep.equal({
              edit: '1',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '-1',
              stack: []
            });
          });

          it('changes the sign of a negative number', () => {
            insertNumberString('-1');
            expect(Calc.state()).to.deep.equal({
              edit: '-1',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '1',
              stack: []
            });
          });

          it('changes the sign of a nonexistent positive number', () => {
            insertNumberString('1');
            Calc.Input.removeCharacter();
            expect(Calc.state()).to.deep.equal({
              edit: '',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '-',
              stack: []
            });
          });

          it('changes the sign of a nonexistent negative number', () => {
            insertNumberString('-1');
            Calc.Input.removeCharacter();
            expect(Calc.state()).to.deep.equal({
              edit: '-',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '',
              stack: []
            });
          });
        });

        describe('when the number is in scientific notation (E)', () => {
          it('changes the sign of an implied positive exponent', () => {
            insertNumberString('1E5');
            expect(Calc.state()).to.deep.equal({
              edit: '1E5',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '1E-5',
              stack: []
            });
          });

          it('changes the sign of an explicit positive exponent', () => {
            insertNumberString('1E+5');
            expect(Calc.state()).to.deep.equal({
              edit: '1E+5',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '1E-5',
              stack: []
            });
          });

          it('changes the sign of a negative exponent', () => {
            insertNumberString('3E-2');
            expect(Calc.state()).to.deep.equal({
              edit: '3E-2',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3E+2',
              stack: []
            });
          });

          it('changes the sign of an implied nonexistent postive exponent', () => {
            insertNumberString('3E');
            expect(Calc.state()).to.deep.equal({
              edit: '3E',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3E-',
              stack: []
            });
          });

          it('changes the sign of an explicit nonexistent postive exponent', () => {
            insertNumberString('3E+');
            expect(Calc.state()).to.deep.equal({
              edit: '3E+',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3E-',
              stack: []
            });
          });

          it('changes the sign of a nonexistent negative exponent', () => {
            insertNumberString('3E-');
            expect(Calc.state()).to.deep.equal({
              edit: '3E-',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3E+',
              stack: []
            });
          });
        });

        describe('when the number is in scientific notation (e)', () => {
          it('changes the sign of an implied positive exponent', () => {
            insertNumberString('1e5');
            expect(Calc.state()).to.deep.equal({
              edit: '1e5',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '1e-5',
              stack: []
            });
          });

          it('changes the sign of an explicit positive exponent', () => {
            insertNumberString('1e+5');
            expect(Calc.state()).to.deep.equal({
              edit: '1e+5',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '1e-5',
              stack: []
            });
          });

          it('changes the sign of a negative exponent', () => {
            insertNumberString('3e-2');
            expect(Calc.state()).to.deep.equal({
              edit: '3e-2',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3e+2',
              stack: []
            });
          });

          it('changes the sign of an implied nonexistent postive exponent', () => {
            insertNumberString('3e');
            expect(Calc.state()).to.deep.equal({
              edit: '3e',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3e-',
              stack: []
            });
          });

          it('changes the sign of an explicit nonexistent postive exponent', () => {
            insertNumberString('3e+');
            expect(Calc.state()).to.deep.equal({
              edit: '3e+',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3e-',
              stack: []
            });
          });

          it('changes the sign of a nonexistent negative exponent', () => {
            insertNumberString('3e-');
            expect(Calc.state()).to.deep.equal({
              edit: '3e-',
              stack: []
            });
            Calc.Input.changeSign();
            expect(Calc.state()).to.deep.equal({
              edit: '3e+',
              stack: []
            });
          });
        });
      });

      describe('when not editing', () => {
        it('changes the sign of a positive number on the stack', () => {
          pushNumberString('123');
          Calc.Input.changeSign();
          expect(Calc.state()).to.deep.equal({
            stack: [-123]
          });
        });
        it('changes the sign of a negative number on the stack', () => {
          pushNumberString('-123');
          Calc.Input.changeSign();
          expect(Calc.state()).to.deep.equal({
            stack: [123]
          });
        });

        it('returns a error for an empty stack', () => {
          Calc.Input.changeSign();
          expect(Calc.state()).to.deep.equal({
            error: 'TooFewArguments',
            stack: []
          });
        });
      });
    });

  });

  describe('Stack', () => {
    it('processes push', () => {
      Calc.Input.insertCharacter(1);
      Calc.Stack.push();
      expect(Calc.state()).to.deep.equal({
        stack: [1]
      });
    });

    it('clears the stack', () => {
      Calc.Input.insertCharacter('5');
      Calc.Input.insertCharacter('4');
      expect(Calc.state()).to.deep.equal({
        edit: '54',
        stack: []
      });
      Calc.Stack.push();
      Calc.Stack.clear();
      expect(Calc.state()).to.deep.equal({
        stack: []
      });
    });

    describe('drop', () => {
      describe('when editing', () => {
        it('ends editing and drops the value', () => {
          Calc.Input.insertCharacter('5');
          Calc.Stack.drop();
          expect(Calc.state()).to.deep.equal({
            stack: []
          });
        });
      });

      describe('when not editing and the stack is not empty', () => {
        it('drops the value', () => {
          pushNumberString('5');
          Calc.Stack.drop();
          expect(Calc.state()).to.deep.equal({
            stack: []
          });
        });
      });

      describe('when not editing and the stack is empty', () => {
        it('returns an error', () => {
          Calc.Stack.drop();
          expect(Calc.state()).to.deep.equal({
            error: 'TooFewArguments',
            stack: []
          });
        });
      });
    });
  });

  describe('Operation', () => {
    it('returns an error if only one argument is available', () => {
      pushNumberString('8');
      Calc.Operation.add();
      expect(Calc.state()).to.deep.equal({
        error: 'TooFewArguments',
        stack: [8]
      });
    });

    it('returns an error if no arguments are available', () => {
      Calc.Operation.add();
      expect(Calc.state()).to.deep.equal({
        error: 'TooFewArguments',
        stack: []
      });
    });

    describe('add', () => {
      it('adds two numbers', () => {
        pushNumberString('3.14');
        pushNumberString('6.86');
        Calc.Operation.add();
        expect(Calc.state()).to.deep.equal({
          stack: [10]
        });
      });
    });

    describe('subtract', () => {
      it('subtracts two numbers', () => {
        pushNumberString('3');
        pushNumberString('2');
        Calc.Operation.subtract();
        expect(Calc.state()).to.deep.equal({
          stack: [1]
        });
      });
    });

    describe('multiply', () => {
      it('multiplies two numbers', () => {
        pushNumberString('2');
        pushNumberString('4');
        Calc.Operation.multiply();
        expect(Calc.state()).to.deep.equal({
          stack: [8]
        });
      });
    });

    describe('divide', () => {
      it('Divides two numbers', () => {
        pushNumberString('8');
        pushNumberString('4');
        Calc.Operation.divide();
        expect(Calc.state()).to.deep.equal({
          stack: [2]
        });
      });

      it('returns an error when dividing by 0', () => {
        pushNumberString('1');
        pushNumberString('0');
        Calc.Operation.divide();
        expect(Calc.state()).to.deep.equal({
          error: 'InfiniteResult',
          stack: [0, 1]
        });
      });
    });

    describe('sin', () => {
      it('takes the sin of a number', () => {
        pushNumberString(String(Math.PI / 2));
        Calc.Operation.sin();
        expect(Calc.state()).to.deep.equal({
          stack: [1]
        });
      });
    });


  });

});
