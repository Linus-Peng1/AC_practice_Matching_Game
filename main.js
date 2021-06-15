const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GaneFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const view = {
  getCardElement(index) {
    return `<div data-index=${index} class="card back "></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src=" ${symbol}">
      <p>${number}</p>
    `
  },
  redCard(card) {
    console.log(card)
    card.classList.add('redCard')
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        while (Number(card.dataset.index) > 12 && Number(card.dataset.index < 36)) {
          this.redCard(card)
          break
        }

        card.innerHTML = view.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳反面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  transformNumber(number) {
    switch (number) {
      case 1: return 'A'
      case 11: return 'J'
      case 12: return 'Q'
      case 13: return 'K'
      default: return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // rootElement.innerHTML = this.getCardElement(index)
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>
        event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  score: 0,
  triedTimes: 0,
  revealedCards: [],

  isRevealedCardsMatch() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

const controller = {
  currentStage: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentStage) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentStage = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 判斷配對是否成功
        if (model.isRevealedCardsMatch()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentStage = GAME_STATE.CardMatche
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          // 判斷是否已經結束
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentStage = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentStage = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log('current state: ', this.currentStage)
    // console.log('revealed cards: ', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentStage = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

// querySeletorAll 為 Node List (arrary like)
document.querySelectorAll('.card').forEach(card =>
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  }))