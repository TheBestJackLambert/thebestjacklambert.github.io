import requests
import json

old_price_buy = 1
old_price_sell = 1
buy_price = 1
sell_price = 1

def get_bazaar_data(api_key):
    base_url = 'https://api.hypixel.net'
    endpoint = '/skyblock/bazaar'
    headers = {
        'Accept': 'application/json',
    }
    params = {
        'key': api_key,
    }
    response = requests.get(base_url + endpoint, headers=headers, params=params)
    try:
        data = response.json()
    except json.JSONDecodeError:
        print("Error decoding JSON response. The response might be too large or the API might be experiencing issues.")
        return None
    return data

api_key = '6a8c4882-3ad8-4136-a81d-51ecb1244f7a'  # replace with your API key
price_drop_threshold = 0.2  # e.g., 20% drop in price
price_rise_threshold = 0.2  # e.g., 20% rise in price
margin_change_threshold = 0.2

old_prices_sell = {}
old_prices_buy = {}
price_drop_list = []

while True:
    bazaar_data = get_bazaar_data(api_key)
    if bazaar_data is None:
        continue
    
    for product_id, product_data in bazaar_data['products'].items():
        if not product_data['sell_summary'] or not product_data['buy_summary']:
            continue
        
        sell_price = product_data['sell_summary'][0]['pricePerUnit']
        buy_price = product_data['buy_summary'][0]['pricePerUnit']
        ratio = round(buy_price - sell_price, 1)
        
        old_price_sell = old_prices_sell.get(product_id)
        old_price_buy = old_prices_buy.get(product_id)
        
        if old_price_sell and old_price_buy and buy_price and sell_price:
            if old_price_sell and sell_price < old_price_sell * (1 - price_drop_threshold) and product_id not in [i[0] for i in price_drop_list]:
                percent = int(round(100 * (sell_price / old_price_sell), 0))
                print(f"The sell price of {product_id} has dropped significantly with a sell and buy price of ${sell_price} and ${buy_price}. The percent change was {percent}% of the previous price.")
                price_drop_list.append((product_id, old_price_sell))
            
            elif old_price_buy and buy_price > old_price_buy * (1 + price_rise_threshold):
                percent = int(round(100 * (buy_price / old_price_buy), 0)) - 1
                print(f"The buy price of {product_id} has skyrocketed with a sell and buy price of ${sell_price} and ${buy_price}. The percent change was {percent}% from the previous price.")
            
            elif buy_price / sell_price > old_price_buy / old_price_sell and (buy_price / sell_price) / (old_price_buy / old_price_sell) > 1 + margin_change_threshold:
                percent = int(round(100 * ((buy_price / sell_price) / (old_price_buy / old_price_sell)), 5)) - 1
                print(f"The bazaar flipping margin for {product_id} has increased by {percent}%. The flipping margin is {int(round(buy_price / sell_price, 3))}X with an item cost of ${sell_price}.")
            
            for dropped_product_id, original_price in price_drop_list[:]:
                current_product_data = bazaar_data['products'].get(dropped_product_id)
                if current_product_data and current_product_data['sell_summary'] and current_product_data['sell_summary'][0]['pricePerUnit'] >= original_price:
                    print(f"The sell price of {dropped_product_id} has returned to its normal price of {original_price}.")
                    price_drop_list.remove((dropped_product_id, original_price))
        
        old_prices_sell[product_id] = sell_price
        old_prices_buy[product_id] = buy_price
