# 🎲 Assassin Dice Game

A strategic dice game where players aim for exactly 30 points while avoiding elimination. Go over 30 to enter attack mode and hunt for specific numbers to deal damage to opponents!

## 🎯 Game Overview

**Objective:** Be the last player standing by managing your score and strategically attacking opponents.

**Players:** 2-6 players (1 human + AI opponents)

**Starting Points:** 30 per player

## 🎮 How to Play

### Basic Turn Flow

1. **Roll Dice** - Start with 6 dice (7 if below 15 points)
2. **Keep Dice** - Must keep at least one die after each roll
3. **Choose Action:**
    - Roll again (max 6 rolls per turn)
    - End turn
    - Enter attack mode (if score > 30)

### Scoring System

| Score | Result | Effect |
|-------|--------|--------|
| **< 30** | ❌ Lose Points | Lose the difference (Roll 25 = Lose 5 points) |
| **= 30** | ✅ Perfect! | No change to points |
| **> 30** | ⚔️ Attack Available | Can enter attack mode or skip |

## ⚔️ Attack Mode

When you roll over 30, you can enter attack mode to hunt for specific numbers:

1. **Enter Attack Mode** - Hunt for the "excess" number (Roll 33 = Hunt for 3's)
2. **Roll and Keep** - Only keep dice showing your target number
3. **Deal Damage** - Each kept die deals its face value in damage
4. **Target Next Players** - Damage flows in game direction

**Example:** Roll 35 → Hunt for 5's → Keep two 5's → Deal 10 damage total

## 🛡️ Special Rules

### Comeback Mode
- Players with **< 15 points** get **7 dice** instead of 6

### Must Keep Rule
- After **every roll**, you must keep at least one die before rolling again
- This applies in both normal play and attack mode

### Elimination
- Players are eliminated at **0 points**
- Damage continues to next player if target doesn't have enough points

## 🎲 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

### Option 1: Quick Start (Recommended)

1. **Create a new React project:**
   ```bash
   npx create-react-app assassin-dice-game
   cd assassin-dice-game
   ```

2. **Install required dependencies:**
   ```bash
   npm install lucide-react
   ```

3. **Set up Tailwind CSS:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind CSS:**

   Replace the contents of `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```

   Replace the contents of `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. **Replace the game code:**
    - Copy the entire Assassin game component code
    - Replace all contents in `src/App.js` with the game code
    - Make sure the import statements are at the top

6. **Start the development server:**
   ```bash
   npm start
   ```

7. **Open your browser:**
    - The app will automatically open at `http://localhost:3000`
    - If it doesn't open automatically, navigate to that URL

### Option 2: Alternative Setup (No Build Tools)

If you want to run it without setting up a full React environment:

1. **Create a simple HTML file:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <script src="https://cdn.tailwindcss.com"></script>
     <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
     <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
   </head>
   <body>
     <div id="root"></div>
     <script type="text/babel">
       // Paste the game component code here
     </script>
   </body>
   </html>
   ```

### Option 3: Using Vite (Faster Alternative)

```bash
npm create vite@latest assassin-dice-game -- --template react
cd assassin-dice-game
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then follow steps 4-7 from Option 1.

## 🚀 Running the Application

### Development Mode
```bash
npm start          # Starts development server
```
- Opens `http://localhost:3000` in your browser
- Hot-reload enabled (changes update automatically)
- Console shows any errors

### Production Build
```bash
npm run build      # Creates optimized production build
npm install -g serve
serve -s build     # Serves the production build
```

### Troubleshooting

**Common Issues:**

1. **"npm not found"**
    - Install Node.js from [nodejs.org](https://nodejs.org/)
    - Restart your terminal

2. **Port 3000 already in use:**
   ```bash
   npm start -- --port 3001
   ```

3. **Tailwind styles not working:**
    - Make sure `src/index.css` contains the Tailwind imports
    - Restart the development server

4. **Lucide icons not showing:**
    - Verify lucide-react is installed: `npm list lucide-react`
    - Reinstall if needed: `npm install lucide-react`

### File Structure
After setup, your project should look like:
```
assassin-dice-game/
├── public/
├── src/
│   ├── App.js          (your game code here)
│   ├── index.css       (Tailwind imports)
│   └── index.js
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎪 Game Features

- **Animated Dice Rolling** with visual feedback
- **Sound Effects** for attacks, eliminations, and perfect scores
- **Smart AI Opponents** with strategic decision-making
- **Interactive Rules** - Built-in rule book accessible anytime
- **Responsive Design** - Works on desktop and mobile
- **Game Log** - Track all actions and eliminations
- **Comeback Mechanics** - Extra dice for struggling players

## 🎯 Strategy Tips

### General Strategy
- **Aim for 30** to stay safe
- **Manage risk** vs reward when deciding to continue rolling
- **Watch opponent scores** to time your attacks

### Attack Strategy
- **Higher target numbers** (4-6) deal more damage per die
- **Lower target numbers** (1-3) are easier to find multiples of
- **Consider game position** - sometimes skipping attacks is safer

### Defense Strategy
- **Stay above 15 points** to avoid comeback mode
- **Position matters** - sitting next to weak players makes you vulnerable
- **Emergency planning** - know when to take risks vs play safe

## 🔧 Game Configuration

### Player Count
- **2 Players:** Intense 1v1 battles
- **3-4 Players:** Balanced gameplay with multiple threats
- **5-6 Players:** Chaotic with rapid eliminations

### Direction Settings
- **Clockwise:** Standard attack flow
- **Counter-clockwise:** Reverse attack direction

## 📖 Quick Reference

### Turn Actions
| Action | When Available | Effect |
|--------|---------------|--------|
| Roll Dice | Rolls < 6, dice kept | Roll non-kept dice |
| End Turn | Dice kept | Apply scoring, next player |
| Enter Attack | Score > 30 | Hunt for target numbers |
| End Attack | In attack mode | Deal accumulated damage |

### Visual Indicators
- **Green Border:** Kept dice (normal mode)
- **Red Border:** Kept dice (attack mode)
- **🎯 Symbol:** Target dice in attack mode
- **⚡ Symbol:** Comeback mode active
- **💀 Skull:** Eliminated player

## 🏆 Winning

**Victory Condition:** Last player with points > 0 wins!

**Game Length:** Typically 10-20 minutes depending on player count and strategy

## 🤝 Contributing

Feel free to suggest improvements or report bugs. This game was designed for fun and strategic gameplay!

## 📝 License

This is a fun project - feel free to use and modify as you like!

---

**Have fun assassinating your opponents! 🎲⚔️**