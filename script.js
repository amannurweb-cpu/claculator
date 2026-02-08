let expression = '';
let justEvaluated = false;

const OPERATORS = new Set(['+', '-', '*', '/']);
const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2 };

const sanitizeExpression = (input) => input.replace(/[^0-9+\-*/.()]/g, '');

const isOperator = (token) => OPERATORS.has(token);

const tokenize = (input) => {
  const tokens = [];
  let numberBuffer = '';

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (/\d|\./.test(char)) {
      numberBuffer += char;
      continue;
    }

    if (numberBuffer) {
      if ((numberBuffer.match(/\./g) || []).length > 1) {
        throw new Error('Invalid number');
      }
      tokens.push(numberBuffer);
      numberBuffer = '';
    }

    if (char === '(' || char === ')' || isOperator(char)) {
      tokens.push(char);
    } else {
      throw new Error('Invalid character');
    }
  }

  if (numberBuffer) {
    if ((numberBuffer.match(/\./g) || []).length > 1) {
      throw new Error('Invalid number');
    }
    tokens.push(numberBuffer);
  }

  return tokens;
};

const toRpn = (tokens) => {
  const output = [];
  const operatorStack = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (!Number.isNaN(Number(token))) {
      output.push(token);
      continue;
    }

    if (isOperator(token)) {
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (!isOperator(top) || PRECEDENCE[top] < PRECEDENCE[token]) {
          break;
        }
        output.push(operatorStack.pop());
      }
      operatorStack.push(token);
      continue;
    }

    if (token === '(') {
      operatorStack.push(token);
      continue;
    }

    if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop());
      }

      if (operatorStack.pop() !== '(') {
        throw new Error('Mismatched parentheses');
      }
    }
  }

  while (operatorStack.length > 0) {
    const token = operatorStack.pop();
    if (token === '(' || token === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(token);
  }

  return output;
};

const evaluateRpn = (rpnTokens) => {
  const stack = [];

  for (let i = 0; i < rpnTokens.length; i += 1) {
    const token = rpnTokens[i];

    if (!Number.isNaN(Number(token))) {
      stack.push(Number(token));
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new Error('Invalid expression');
    }

    if (token === '+') stack.push(left + right);
    if (token === '-') stack.push(left - right);
    if (token === '*') stack.push(left * right);
    if (token === '/') stack.push(left / right);
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return stack[0];
};

const evaluateMathExpression = (input) => {
  const safeExpression = sanitizeExpression(input);
  if (!safeExpression) return 0;

  const normalized = safeExpression.replace(/(^|[+\-*/(])-\(/g, '$10-(');
  const tokens = tokenize(normalized);
  const rpn = toRpn(tokens);
  return evaluateRpn(rpn);
};

const formatResult = (value) => {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
};

const updateDisplay = (value) => {
  if (typeof document === 'undefined') return;
  const display = document.getElementById('display');
  display.value = value || '0';
};

const evaluateExpression = () => {
  try {
    const result = evaluateMathExpression(expression);
    const formatted = formatResult(result);
    expression = formatted === 'Error' ? '' : formatted;
    updateDisplay(formatted);
    justEvaluated = true;
  } catch {
    expression = '';
    updateDisplay('Error');
    justEvaluated = true;
  }
};

const appendValue = (value) => {
  if (justEvaluated && /\d|\./.test(value)) {
    expression = '';
  }

  if (isOperator(value) && isOperator(expression.at(-1))) {
    expression = `${expression.slice(0, -1)}${value}`;
    updateDisplay(expression);
    justEvaluated = false;
    return;
  }

  if (value === '.') {
    const currentNumber = expression.split(/[+\-*/()]/).pop() || '';
    if (currentNumber.includes('.')) return;
  }

  expression += value;
  updateDisplay(expression);
  justEvaluated = false;
};

const clearAll = () => {
  expression = '';
  justEvaluated = false;
  updateDisplay('0');
};

const deleteLast = () => {
  if (justEvaluated) {
    clearAll();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(expression);
};

if (typeof document !== 'undefined') {
  const keys = document.querySelector('.keys');

  keys.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const { value, action } = button.dataset;

    if (action === 'clear') return clearAll();
    if (action === 'delete') return deleteLast();
    if (action === 'equals') return evaluateExpression();
    if (value) appendValue(value);
  });

  window.addEventListener('keydown', (event) => {
    if (/^[0-9+\-*/().]$/.test(event.key)) {
      appendValue(event.key);
      return;
    }

    if (event.key === 'Enter' || event.key === '=') {
      event.preventDefault();
      evaluateExpression();
      return;
    }

    if (event.key === 'Backspace') return deleteLast();
    if (event.key === 'Escape') return clearAll();
  });

  updateDisplay('0');
}

if (typeof module !== 'undefined') {
  module.exports = {
    evaluateMathExpression,
    sanitizeExpression,
    tokenize,
    toRpn,
    evaluateRpn,
    formatResult,
  };
}
