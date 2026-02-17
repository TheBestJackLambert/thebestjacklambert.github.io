// Project4.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 1000,
    once: true,
  });

  // Initialize Particles.js for background particles
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#ffd700' }, // Gold color
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#ffd700', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' }
      },
      modes: {
        repulse: { distance: 100 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });

  console.log('Particles.js initialized successfully.');

  // Custom Cursor Movement
  // Custom Cursor Movement
  // Cursor logic now handled by shared-interactions.js

  // Back to Top Button Functionality
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  // Scroll Progress Bar Functionality
  window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    scrollProgress.style.width = `${progress}%`;
  });

  // Set Current Year in Footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
  } else {
    console.error('Current year element not found.');
  }

  // ======================
  // Hypixel Bazaar Bot in JS
  // ======================

  // WARNING: This API key is exposed in the client-side code.
  // Ensure that this key has restricted permissions to prevent abuse.
  const apiKey = 'e1385a4b-26f7-402d-ad26-6ae0e0876c21'; // Your API key
  // Lowered thresholds for demonstration purposes (1% changes)
  const priceDropThreshold = 0.01;
  const priceRiseThreshold = 0.01;
  const marginChangeThreshold = 0.05; // 5% margin change

  let oldPricesSell = {};
  let oldPricesBuy = {};
  let priceDropList = [];

  const botOutput = document.getElementById('bot-output');

  // Initial System Message
  addMessage('// SYSTEM_ONLINE: BAZAAR_TRACKER_V4.0');
  addMessage('// INITIALIZING_CONNECTION...');

  // Function to fetch bazaar data
  async function getBazaarData(api_key) {
    const baseUrl = 'https://api.hypixel.net';
    const endpoint = '/skyblock/bazaar';
    const url = `${baseUrl}${endpoint}?key=${api_key}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) {
        throw new Error(`API Error: ${data.cause}`);
      }
      return data;
    } catch (error) {
      console.error('Error fetching bazaar data:', error);
      addMessage(`// ERROR: ${error.message}`);
      return null;
    }
  }

  // Function to add message to the output box
  function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    // Add a glowing effect to new messages
    messageDiv.style.textShadow = '0 0 5px var(--accent-color)';

    // Check if it's a system message or alert
    if (message.startsWith('//')) {
      messageDiv.style.color = 'var(--text-secondary)';
      messageDiv.innerHTML = `<p>${message}</p>`;
    } else {
      // Highlight key info in alerts
      messageDiv.innerHTML = `<p>> ${message}</p>`;
    }

    botOutput.prepend(messageDiv);

    // Limit the number of messages displayed to prevent overflow
    while (botOutput.children.length > 50) {
      botOutput.removeChild(botOutput.lastChild);
    }
  }

  // Function to process bazaar data
  function processBazaarData(bazaarData) {
    if (!bazaarData || !bazaarData.products) return;

    let eventsDetected = 0;

    for (const productId in bazaarData.products) {
      const productData = bazaarData.products[productId];
      if (!productData.sell_summary || !productData.buy_summary) continue;

      // Ensure sell_summary and buy_summary are arrays with at least one element
      if (!Array.isArray(productData.sell_summary) || productData.sell_summary.length === 0) continue;
      if (!Array.isArray(productData.buy_summary) || productData.buy_summary.length === 0) continue;

      const sellPriceData = productData.sell_summary[0];
      const buyPriceData = productData.buy_summary[0];

      if (!sellPriceData.pricePerUnit || !buyPriceData.pricePerUnit) continue;

      const sellPrice = parseFloat(sellPriceData.pricePerUnit);
      const buyPrice = parseFloat(buyPriceData.pricePerUnit);

      if (isNaN(sellPrice) || isNaN(buyPrice)) continue;

      const oldPriceSell = oldPricesSell[productId];
      const oldPriceBuy = oldPricesBuy[productId];

      if (oldPriceSell && oldPriceBuy && buyPrice && sellPrice) {
        // Check for price drop
        if (sellPrice < oldPriceSell * (1 - priceDropThreshold) && !priceDropList.find(item => item[0] === productId)) {
          const percent = Math.round((1 - (sellPrice / oldPriceSell)) * 100);
          addMessage(`SELL ALERT: ${productId} dropped ${percent}% (Sell: $${sellPrice.toFixed(1)} | Buy: $${buyPrice.toFixed(1)})`);
          priceDropList.push([productId, oldPriceSell]);
          eventsDetected++;
        }

        // Check for price rise
        if (buyPrice > oldPriceBuy * (1 + priceRiseThreshold)) {
          const percent = Math.round(((buyPrice / oldPriceBuy) - 1) * 100);
          addMessage(`BUY ALERT: ${productId} rose ${percent}% (Sell: $${sellPrice.toFixed(1)} | Buy: $${buyPrice.toFixed(1)})`);
          eventsDetected++;
        }

        // Check for margin change
        const currentMargin = buyPrice / sellPrice;
        const oldMargin = oldPriceBuy / oldPriceSell;
        if (currentMargin > oldMargin && (currentMargin / oldMargin) > (1 + marginChangeThreshold)) {
          const marginChange = Math.round(((currentMargin / oldMargin) - 1) * 100);
          const flippingMargin = currentMargin.toFixed(2);
          addMessage(`MARGIN ALERT: ${productId} margin +${marginChange}% (New: ${flippingMargin}x | Cost: $${sellPrice.toFixed(1)})`);
          eventsDetected++;
        }

        // Check if price has returned to normal
        priceDropList = priceDropList.filter(([droppedProductId, originalPrice]) => {
          if (productId === droppedProductId && sellPrice >= originalPrice) {
            addMessage(`RECOVERY: ${droppedProductId} returned to normal ($${originalPrice.toFixed(1)})`);
            return false; // Remove from list
          }
          return true; // Keep in list
        });
      }

      // Update old prices
      oldPricesSell[productId] = sellPrice;
      oldPricesBuy[productId] = buyPrice;
    }
  }

  // Function to initialize and start the bot
  let isFirstRun = true;
  async function startBot() {
    const bazaarData = await getBazaarData(apiKey);
    if (bazaarData === null) {
      addMessage('// CONNECTION_RETRYING...');
      return;
    }

    if (isFirstRun) {
      addMessage('// CONNECTION_ESTABLISHED');
      addMessage('// STREAMING_MARKET_DATA...');
      isFirstRun = false;
    }

    processBazaarData(bazaarData);
  }

  // Start the bot immediately and then every 3 seconds
  startBot();
  setInterval(startBot, 3000); // 3000 ms = 3 seconds
});
