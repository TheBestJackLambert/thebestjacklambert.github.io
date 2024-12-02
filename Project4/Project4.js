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
    const cursor = document.querySelector('.cursor');
  
    if (cursor) {
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });
  
      // Add animations to the cursor on hover over interactive elements
      document.querySelectorAll('a, button, .github-btn').forEach(el => { // Included .github-btn for interactivity
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('cursor--active');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('cursor--active');
        });
      });
    } else {
      console.error('Cursor element not found.');
    }
  
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
  
    const apiKey = 'e1385a4b-26f7-402d-ad26-6ae0e0876c21'; // Your API key
    const priceDropThreshold = 0.2; // 20% drop
    const priceRiseThreshold = 0.2; // 20% rise
    const marginChangeThreshold = 0.2; // 20% margin change
  
    let oldPricesSell = {};
    let oldPricesBuy = {};
    let priceDropList = [];
  
    const botOutput = document.getElementById('bot-output');
  
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
        addMessage(`Error fetching data: ${error.message}`);
        return null;
      }
    }
  
    // Function to add message to the output box
    function addMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.innerHTML = `<p>${message}</p>`;
      botOutput.prepend(messageDiv);
  
      // Optional: Limit the number of messages displayed to prevent overflow
      while (botOutput.children.length > 50) {
        botOutput.removeChild(botOutput.lastChild);
      }
    }
  
    // Function to process bazaar data
    function processBazaarData(bazaarData) {
      if (!bazaarData || !bazaarData.products) return;
  
      for (const productId in bazaarData.products) {
        const productData = bazaarData.products[productId];
        if (!productData.sell_summary || !productData.buy_summary) continue;
  
        // Ensure sell_summary and buy_summary are arrays with at least one element
        if (!Array.isArray(productData.sell_summary) || productData.sell_summary.length === 0) {
          console.warn(`sell_summary missing or empty for product: ${productId}`);
          continue;
        }
  
        if (!Array.isArray(productData.buy_summary) || productData.buy_summary.length === 0) {
          console.warn(`buy_summary missing or empty for product: ${productId}`);
          continue;
        }
  
        const sellPriceData = productData.sell_summary[0];
        const buyPriceData = productData.buy_summary[0];
  
        // Check if pricePerUnit exists
        if (!sellPriceData.pricePerUnit || !buyPriceData.pricePerUnit) {
          console.warn(`pricePerUnit missing for product: ${productId}`);
          continue;
        }
  
        const sellPrice = parseFloat(sellPriceData.pricePerUnit);
        const buyPrice = parseFloat(buyPriceData.pricePerUnit);
  
        // Ensure sellPrice and buyPrice are valid numbers
        if (isNaN(sellPrice) || isNaN(buyPrice)) {
          console.warn(`Invalid pricePerUnit for product: ${productId}`);
          continue;
        }
  
        const ratio = parseFloat((buyPrice - sellPrice).toFixed(1));
  
        const oldPriceSell = oldPricesSell[productId];
        const oldPriceBuy = oldPricesBuy[productId];
  
        if (oldPriceSell && oldPriceBuy && buyPrice && sellPrice) {
          // Check for price drop
          if (sellPrice < oldPriceSell * (1 - priceDropThreshold) && !priceDropList.find(item => item[0] === productId)) {
            const percent = Math.round((sellPrice / oldPriceSell) * 100);
            addMessage(`The sell price of ${productId} has dropped significantly with a sell price of $${sellPrice.toFixed(2)} and a buy price of $${buyPrice.toFixed(2)}. The percent change was ${percent}% of the previous price.`);
            priceDropList.push([productId, oldPriceSell]);
          }
  
          // Check for price rise
          if (buyPrice > oldPriceBuy * (1 + priceRiseThreshold)) {
            const percent = Math.round((buyPrice / oldPriceBuy) * 100) - 1;
            addMessage(`The buy price of ${productId} has skyrocketed with a sell price of $${sellPrice.toFixed(2)} and a buy price of $${buyPrice.toFixed(2)}. The percent change was ${percent}% from the previous price.`);
          }
  
          // Check for margin change
          const currentMargin = buyPrice / sellPrice;
          const oldMargin = oldPriceBuy / oldPriceSell;
          if (currentMargin > oldMargin && (currentMargin / oldMargin) > (1 + marginChangeThreshold)) {
            const marginChange = ((currentMargin / oldMargin) - 1) * 100;
            const flippingMargin = currentMargin.toFixed(3);
            addMessage(`The bazaar flipping margin for ${productId} has increased by ${Math.round(marginChange)}%. The flipping margin is ${flippingMargin}X with an item cost of $${sellPrice.toFixed(2)}.`);
          }
  
          // Check if price has returned to normal
          priceDropList = priceDropList.filter(([droppedProductId, originalPrice]) => {
            if (productId === droppedProductId && sellPrice >= originalPrice) {
              addMessage(`The sell price of ${droppedProductId} has returned to its normal price of $${originalPrice.toFixed(2)}.`);
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
    async function startBot() {
      const bazaarData = await getBazaarData(apiKey);
      if (bazaarData === null) {
        addMessage('Failed to fetch bazaar data. Retrying...');
        return;
      }
      processBazaarData(bazaarData);
    }
  
    // Start the bot immediately and then every 3 seconds
    startBot();
    setInterval(startBot, 3000); // 3000 ms = 3 seconds
  });
  