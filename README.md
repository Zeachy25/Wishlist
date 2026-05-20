# Wishlist & Price Drop Notifier

A mobile app that lets you track products, save them to a wishlist, and get notified when prices drop.

## Tech Stack

- **React Native / Expo** — for the mobile app
- **Supabase** — for user login and database
- **SQLite** — for offline data storage
- **Custom store** — simple pub/sub for managing app state

## Features

- **Wishlist** — save products you want to buy later
- **Price Drop Alerts** — get notified when a product price goes down
- **Flash Sale Alerts** — see limited-time deals
- **Browse Products** — search and filter by category
- **Price History Charts** — see how prices changed over time
- **Smart Alerts** — uses Z-score (threshold: 1.5) to find real price drops
- **User Accounts** — sign up with email, Google, or Facebook
- **Cart & Checkout** — buy products directly in the app

## Navigation

The app uses 4 types of navigation:

1. **Bottom tabs** — Home, Browse, Wishlist, Profile, Cart
2. **Drawer** — swipe from the left to see shortcuts
3. **Stack** — moving between screens like Product Details
4. **Modals** — pop-up screens like Set Alert

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npx expo start
   ```

3. Open on your phone using Expo Go, or run on an emulator.

## Run Tests

```bash
npm test
```

There are 17 tests for the price drop algorithm and edge cases.

## Project Structure

```
app/              — Screens and navigation
src/
  algorithms/     — Price processing (Z-score logic)
  components/     — Shared UI parts
  services/       — Supabase API, SQLite database
  store/          — App state management
config/           — Supabase setup
tests/            — Unit tests
```

## OAuth Login

To use Google or Facebook login, you need to add these URLs in your Supabase dashboard (Authentication > URL Configuration):

- `wishlist:///`
