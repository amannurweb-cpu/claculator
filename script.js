const display = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = '';
let justEvaluated = false;

const sanitizeExpression = (input) => {
  const cleaned = input.replace(/[^0-9+\-*/.()]/g, '');
  return cleaned;
};

const formatResult = (value) => {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
};

const updateDisplay = (value) => {
  display.value = value || '0';
};

const evaluateExpression = () => {
  const safeExpression = sanitizeExpression(expression);

  if (!safeExpression) {
    updateDisplay('0');
    return;
  }

  try {
    const result = Function(`"use strict"; return (${safeExpression});`)();
    const formatted = formatResult(Number(result));
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

  justEvaluated = false;

  if (value === '.') {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (currentNumber.includes('.')) {
      return;
    }
  }

  expression += value;
  updateDisplay(expression);
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

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { value, action } = button.dataset;

  if (action === 'clear') {
    clearAll();
    return;
  }

  if (action === 'delete') {
    deleteLast();
    return;
  }

  if (action === 'equals') {
    evaluateExpression();
    return;
  }

  if (value) {
    appendValue(value);
  }
});

window.addEventListener('keydown', (event) => {
  if (/^[0-9+\-*/.]$/.test(event.key)) {
    appendValue(event.key);
  } else if (event.key === 'Enter' || event.key === '=') {
    event.preventDefault();
    evaluateExpression();
  } else if (event.key === 'Backspace') {
    deleteLast();
  } else if (event.key === 'Escape') {
    clearAll();
  }
});

updateDisplay('0');
