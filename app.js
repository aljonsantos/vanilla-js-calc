const initialState = {
  calc: {
    display: '0',
    prev: null,
    equation: '',
    operation: null,
    isAwaitingSecondOperand: false,
    isDisplayingResult: false,
    isError: false
  },
  theme: {
    isDarkMode: false
  }
}

class Calculator {
  constructor() {
    this.state =  this.load() || { ...initialState }
  }

  static signs = {
    plus: '+',
    minus: '-',
    times: 'x',
    divide: '/'
  }

  calc() {
    return this.state.calc
  }
  
  save() {
    localStorage.setItem('calc-vanilla-js', JSON.stringify(this.state))
  }

  load() {
    return JSON.parse(localStorage.getItem('calc-vanilla-js'))
  }
  
  reset() {
    this.state.calc = { ...initialState.calc }
    this.updateDisplay()
  }
  
  updateDisplay() {
    document.querySelector('.display__main').textContent = this.formattedDisplay()
    document.querySelector('.display__equation').textContent = this.calc().equation
  }
  
  setDisplay(value) {
    this.calc().display = value
    this.updateDisplay()
  }

  appendDisplay(value) {
    this.calc().display += value
    this.updateDisplay()
  }

  setEquation(equation) {
    this.calc().equation = equation
    this.updateDisplay()
  }
  
  delete() {
    if (this.calc().isDisplayingResult) {
      this.reset()
    } else {
      this.setDisplay(this.calc().display.slice(0, -1) || '0')
    }
  }

  appendDigit(value) {
    if (this.calc().isAwaitingSecondOperand) {
      this.setDisplay(value)
      this.calc().isAwaitingSecondOperand = false
    }
    else if (this.calc().display === '0') {
      this.setDisplay(value)
    } else {  
      this.appendDisplay(value)
    }
  }

  appendDot() {
    if (this.calc().isAwaitingSecondOperand) {
      this.setDisplay('0.')
      this.calc().isAwaitingSecondOperand = false
    }
    else if (!this.calc().display.includes('.')) {
      this.appendDisplay('.')
    }
  }

  setOperator(operator) {
    const calc = this.calc()

    if (calc.operation && !calc.isDisplayingResult && !calc.isAwaitingSecondOperand) {
      const result = this.compute(calc.prev, parseFloat(calc.display))
      this.setDisplay(result)
    }

    calc.prev = parseFloat(calc.display) 
    calc.operation = operator
    this.setEquation(`${calc.prev} ${Calculator.signs[calc.operation]}`)
    calc.isAwaitingSecondOperand = true
    calc.isDisplayingResult = false
  }

  equals() {
    const calc = this.calc()

    if (!calc.operation) return
    
    if (calc.isDisplayingResult) {
      this.setEquation(`${parseFloat(calc.display)} ${Calculator.signs[calc.operation]} ${calc.prev} =`)
      const result = this.compute(parseFloat(calc.display), calc.prev)
      this.setDisplay(result)
    } else {
      this.setEquation(`${calc.equation} ${parseFloat(calc.display)} =`)
      const result = this.compute(calc.prev, parseFloat(calc.display))
      calc.prev = parseFloat(calc.display)
      this.setDisplay(result)
    }

    this.calc().isDisplayingResult = true
  }

  compute(x, y) {
    console.log(`calc: ${x} ${this.state.operation} ${y}`)

    let res 
    switch (this.calc().operation) {
      case 'plus':
        res = x + y
        break
      case 'minus':
        res = x - y
        break
      case 'times':
        res = x * y
        break
      case 'divide':
        res = x / y
        break
    }

    if (!isFinite(res) || isNaN(res)) {
      this.calc().isError = true
      return
    }

    return Number(res.toFixed(4)).toString()
  }

  formattedDisplay() {
    if (this.calc().isError) {
      return 'Error'
    }

    const display = this.calc().display
    const [whole, decimal] = display.split('.')
    if(display.includes('.')) {
      return `${parseFloat(whole).toLocaleString()}.${decimal}`
    }
    return `${parseFloat(whole).toLocaleString()}`
  }
  
  enableDarkMode() {
    this.state.theme.isDarkMode = true
    document.querySelector('.theme-switcher .toggle').classList.add('active')
    document.body.classList.add('dark')
  }

  disableDarkMode() {
    this.state.theme.isDarkMode = false
    document.querySelector('.theme-switcher .toggle').classList.remove('active')
    document.body.classList.remove('dark')
  }
}

const calc = new Calculator()
calc.updateDisplay()
if (calc.state.theme.isDarkMode) {
  calc.enableDarkMode()
}

toggleDarkModeBtn = document.querySelector('.theme-switcher .toggle')
toggleDarkModeBtn.addEventListener('click', () => {
  if (calc.state.theme.isDarkMode) {
    calc.disableDarkMode()
  } else {
    calc.enableDarkMode()
  }

  calc.save()
})

const keypad = document.querySelector('.keypad')
keypad.addEventListener('click', (e) => {
  const target = e.target
  const action = target.dataset.action

  if (calc.calc().isError && action !== 'reset') {
    return
  }

  switch (action) {
    case 'digit':
      if (calc.calc().isDisplayingResult) {
        calc.reset()
      }
      const value = target.dataset.value
      value === '.' ? calc.appendDot() : calc.appendDigit(value)
      break
    case 'operator':
      const operation = target.dataset.value
      calc.setOperator(operation)
      break
    case 'delete':
      calc.delete()
      break
    case 'reset':
      calc.reset()
      break
    case 'equals':
      calc.equals()
      break
  }
  
  calc.save()
})
