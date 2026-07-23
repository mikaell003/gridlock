# 🎮 GridLogic: Fuse & Clear

A fast-paced browser puzzle game where players strategically clear colored blocks before the board fills up.

## 📖 About

**[GridLogic: Fuse & Clear](https://github.com/mikaell003/gridlogic)** is a minimalist arcade-puzzle game built with pure HTML, CSS, and JavaScript. Colored blocks continuously spawn onto a 6×6 grid. Players must click empty cells to fuse and clear neighboring blocks of the same color, earning points and increasing their score multiplier.

The challenge grows over time as blocks spawn faster and faster. Once the grid is completely filled, the game ends.

---

## ✨ Features

* **One-Click Gameplay**: Intuitive mechanics for all ages.
* **Five Colors**: Unique block colors create diverse boards.
* **Scaling Difficulty**: Spawning speeds up over time.
* **Combo Multiplier**: Higher risks yield bigger score rewards.
* **Fully Responsive**: Optimized for desktop, tablet, and mobile.
* **Vanilla Tech**: Zero frameworks for lightning-fast loads.
* **Instant Play**: Runs directly in any modern browser.

---

## 🕹️ How to Play

1. **Watch**: Wait for colored blocks to appear.
2. **Target**: Click an empty cell adjacent to blocks.
3. **Fuse**: Matching adjacent colors clear instantly.
4. **Score**: Earn points for every successful clear.
5. **Chain**: Build multiplier chains for massive scores.
6. **Survive**: Keep clearing before the board fills up.

---

## 🏆 Scoring System

| Blocks Cleared | Base Points | Multiplier Impact |
| :--- | :--- | :--- |
| **2 Blocks** | 20 | 20 × Current Multiplier |
| **3 Blocks** | 30 | 30 × Current Multiplier |
| **4 Blocks** | 40 | 40 × Current Multiplier |
| **5+ Blocks** | 50 | 50 × Current Multiplier |

* 🔥 **Success**: Clears increase your current multiplier.
* ⚠️ **Failure**: Missed moves reset the multiplier to 1.

---

## 🛠️ Tech Stack

* **Structure**: HTML5 Semantic Markup
* **Styling**: CSS3 Custom Properties & Flexbox/Grid
* **Logic**: JavaScript (ES6+) Canvas/DOM Manipulation

---

## 📂 Project Structure

```text
GridLogic/
├── index.html          # Game UI structure
├── styles.css          # Responsive layouts & animations
├── game.js            # Core game logic & engine
└── README.md           # Documentation
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/mikaell003/gridlogic.git
```

### 2. Navigate to Project
```bash
cd gridlogic
```

### 3. Launch the Game
Open `index.html` directly in your favorite browser, or serve it locally:
```bash
# Using Python to host locally (Optional)
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🎯 Roadmap & Future Improvements

* 🔊 **Audio**: Immersive sound effects and background music.
* ✨ **Visuals**: Dynamic combo animations and particle effects.
* 💾 **Persistence**: High score saving via LocalStorage.
* 🏅 **Competition**: Global leaderboards and achievements.
* ⚡ **Power-ups**: Special bomb or rainbow blocks.
* 🕹️ **Modes**: Time Attack and Endless modes.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Mikaell003**  
*Front-End Developer | Full-Stack Web Builder*  
🚀 Open to contributions and feedback!
