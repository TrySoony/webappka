const roulette = document.getElementById('roulette');
const spinBtn = document.getElementById('spin');
const resultDiv = document.getElementById('result');

// Максимум попыток
const MAX_ATTEMPTS = 2;

function getAttempts() {
  return parseInt(localStorage.getItem('roulette_attempts') || '0', 10);
}
function setAttempts(val) {
  localStorage.setItem('roulette_attempts', val);
}
function incAttempts() {
  setAttempts(getAttempts() + 1);
}
function isSpinAvailable() {
  return getAttempts() < MAX_ATTEMPTS;
}
function updateSpinBtnState() {
  spinBtn.disabled = !isSpinAvailable();
  if (!isSpinAvailable()) {
    spinBtn.textContent = 'Попытки закончились';
  } else {
    spinBtn.textContent = 'Крутить!';
  }
}

function renderPrizes(extendedPrizes) {
  roulette.innerHTML = '';
  extendedPrizes.forEach(prize => {
    const div = document.createElement('div');
    div.className = 'prize';
    if (prize.img) {
      div.innerHTML = `<img src="${prize.img}" class="prize-img" alt="${prize.name}">
                       <div class="prize-name">${prize.name}</div>
                       <div class="prize-price">${prize.starPrice}⭐</div>`;
    } else {
      div.innerHTML = `<div class="prize-name" style="font-size:18px;">${prize.name}</div>
                       <div class="prize-price" style="color:#bbb;">Пусто</div>`;
    }
    roulette.appendChild(div);
  });
}

function getPrizeWidth() {
  const tempPrize = document.createElement('div');
  tempPrize.className = 'prize';
  tempPrize.style.visibility = 'hidden';
  tempPrize.textContent = 'test';
  roulette.appendChild(tempPrize);
  const prizeWidth = tempPrize.offsetWidth;
  roulette.removeChild(tempPrize);
  return prizeWidth;
}

// --- Модальное окно выигрыша и конфетти ---
const winModalOverlay = document.getElementById('win-modal-overlay');
const winModalImg = document.getElementById('win-modal-img');
const winModalTitle = document.getElementById('win-modal-title');
const winModalPrice = document.getElementById('win-modal-price');
const winModalBtn = document.getElementById('win-modal-btn');

function launchConfetti() {
  if (typeof confetti !== 'function') return;
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 101 };
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

function showWinModal(prize) {
  winModalImg.src = prize.img;
  winModalTitle.textContent = prize.name;
  winModalPrice.textContent = `${prize.starPrice}⭐`;
  winModalOverlay.classList.add('visible');
  launchConfetti();
}
function hideWinModal() {
  winModalOverlay.classList.remove('visible');
}
winModalOverlay.addEventListener('click', (e) => {
  if (e.target === winModalOverlay) {
    hideWinModal();
  }
});
winModalBtn.addEventListener('click', () => {
  hideWinModal();
  // Переключаемся на вкладку "Мои подарки"
  const giftsTab = document.querySelector('.tab-btn[data-tab="gifts"]');
  if (giftsTab) giftsTab.click();
});

function spinRoulette() {
  if (!isSpinAvailable()) return;
  incAttempts();
  updateSpinBtnState();
  resultDiv.textContent = '';

  const prizeCount = prizes.length;
  const prizeWidth = getPrizeWidth();
  const visibleCount = Math.floor(roulette.parentElement.offsetWidth / prizeWidth);
  const centerIndex = Math.floor(visibleCount / 2);

  const randomIndex = Math.floor(Math.random() * prizeCount);
  const rounds = Math.floor(Math.random() * 3) + 5;
  const totalSteps = rounds * prizeCount + randomIndex;
  const extendedLength = totalSteps + visibleCount + 2;
  let extendedPrizes = [];
  while (extendedPrizes.length < extendedLength) {
    extendedPrizes = extendedPrizes.concat(prizes);
  }
  extendedPrizes = extendedPrizes.slice(0, extendedLength);

  renderPrizes(extendedPrizes);

  const offset = (totalSteps - centerIndex) * prizeWidth;

  roulette.style.transition = 'none';
  roulette.style.transform = 'translateX(0px)';

  requestAnimationFrame(() => {
    roulette.style.transition = 'transform 2s cubic-bezier(0.15, 0.85, 0.35, 1)';
    roulette.style.transform = `translateX(-${offset}px)`;
  });

  setTimeout(() => {
    const pointer = document.querySelector('.pointer');
    const pointerRect = pointer.getBoundingClientRect();
    const prizeDivs = document.querySelectorAll('.prize');
    let foundPrize = null;
    prizeDivs.forEach(div => {
      const rect = div.getBoundingClientRect();
      if (
        pointerRect.left >= rect.left &&
        pointerRect.left <= rect.right
      ) {
        foundPrize = div.querySelector('.prize-name').textContent;
      }
    });
    let prizeUnderPointer = null;
    if (foundPrize) {
      prizeUnderPointer = prizes.find(prize => foundPrize === prize.name);
    }
    if (!prizeUnderPointer) {
      prizeUnderPointer = prizes[randomIndex % prizeCount];
    }
    if (prizeUnderPointer.starPrice > 0) {
      resultDiv.textContent = `Вы выиграли: ${prizeUnderPointer.name} (${prizeUnderPointer.starPrice}⭐)!`;
      saveGift(prizeUnderPointer);
      showWinModal(prizeUnderPointer);
      // Не отправляем sendData, только показываем модалку
    } else {
      resultDiv.textContent = `Вы ничего не выиграли.`;
      // Не отправляем sendData
    }
    spinBtn.disabled = !isSpinAvailable();
    if (!isSpinAvailable()) {
      spinBtn.textContent = 'Попытки закончились';
    } else {
      spinBtn.textContent = 'Крутить!';
    }
  }, 2000);
}

// Функция для обновления списка подарков на вкладке "Мои подарки"
function updateGiftsListFromStorage() {
  const gifts = JSON.parse(localStorage.getItem('my_gifts') || '[]');
  const list = document.getElementById('my-gifts-list');
  if (!list) return;
  if (gifts.length === 0) {
    list.innerHTML = '<div style="color:#888;margin-top:30px;">Подарков пока нет</div>';
    return;
  }
  list.innerHTML = gifts.map((gift, index) => `
    <li><div class="gift-card">
      <img src="${gift.img}" alt="${gift.name}">
      <div class="gift-card-title">${gift.name}</div>
      <div class="gift-card-date">Выигран: ${gift.date}</div>
      <button class="gift-card-btn" data-gift-index="${index}">Нажмите для вывода</button>
    </div></li>
  `).join('');
}

// При загрузке страницы сразу обновляем список подарков
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateGiftsListFromStorage);
} else {
  updateGiftsListFromStorage();
}

// Обработчик для кнопки "Вывести" на подарке
const myGiftsList = document.getElementById('my-gifts-list');
if (myGiftsList) {
  myGiftsList.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('gift-card-btn')) {
      const giftIndex = e.target.dataset.giftIndex;
      const gifts = JSON.parse(localStorage.getItem('my_gifts') || '[]');
      const gift = gifts[giftIndex];
      if (gift && window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({action: "withdraw_gift", gift}));
        Telegram.WebApp.close();
      }
    }
  });
}

function saveGift(prize) {
  if (prize.starPrice === 0) return; // не сохраняем пусто
  const gifts = JSON.parse(localStorage.getItem('my_gifts') || '[]');
  gifts.push({
    name: prize.name,
    img: prize.img,
    starPrice: prize.starPrice,
    date: new Date().toLocaleDateString('ru-RU')
  });
  localStorage.setItem('my_gifts', JSON.stringify(gifts));
  updateGiftsListFromStorage(); // обновляем список сразу после добавления
}

// Первичная отрисовка (по умолчанию 3 круга)
(function(){
  const prizeCount = prizes.length;
  const prizeWidth = getPrizeWidth();
  const visibleCount = Math.floor(roulette.parentElement.offsetWidth / prizeWidth);
  const rounds = 3;
  const totalSteps = rounds * prizeCount;
  const extendedLength = totalSteps + visibleCount + 2;
  let extendedPrizes = [];
  while (extendedPrizes.length < extendedLength) {
    extendedPrizes = extendedPrizes.concat(prizes);
  }
  extendedPrizes = extendedPrizes.slice(0, extendedLength);
  renderPrizes(extendedPrizes);
})();

// При загрузке страницы обновляем состояние кнопки
updateSpinBtnState();

spinBtn.addEventListener('click', spinRoulette);