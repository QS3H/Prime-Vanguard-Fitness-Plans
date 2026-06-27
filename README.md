# Prime Vanguard Fitness Plans

A collection of personalized, interactive web-based fitness transformation plans designed for the Prime Vanguard Physical Mastery Brotherhood. Each plan focuses on body recomposition—building muscle while losing fat—through structured training, nutrition, and progress tracking.

## Overview

Prime Vanguard Fitness Plans provides individualized 4-week transformation programs with:

- **Interactive Workout Tracking**: Track exercise completion and weights with visual progress indicators
- **Body Analysis Dashboard**: View current stats, targets, and critical health metrics
- **Customizable Exercises**: Edit exercise names directly in the interface
- **Progress Management**: Export/import progress data for backup and device transfer
- **Print-Ready Design**: Optimized for printing to PDF or physical copies
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

[Live Landing Page](https://qs3h.github.io/Prime-Vanguard-Fitness-Plans/)

## Repository Structure

```
Prime Vanguard Fitness Plans/
├── public/                      # Shared static assets (logo, images)
│   └── Prime_Vanguard-Logo.png
├── Abdelaziz-Fitness-Plan/      # Individual fitness plan for Abdelazzez
│   ├── public/                  # Static assets (logo, images)
│   │   └── Prime_Vanguard-Logo.png
│   ├── index.html               # Main application file
│   ├── script.js                # Interactive functionality and progress tracking
│   ├── styles.css               # Styling and responsive design
│   └── README.md                # Plan-specific documentation
├── Abdulrahman-Fitness-Plan/    # Individual fitness plan for Abdulrahman
│   ├── public/                  # Static assets (logo, images)
│   │   └── Prime_Vanguard-Logo.png
│   ├── index.html               # Main application file
│   ├── script.js                # Interactive functionality and progress tracking
│   ├── styles.css               # Styling and responsive design
│   └── README.md                # Plan-specific documentation
├── index.html                   # Landing page with links to all plans
└── README.md                    # This file
```

## Available Plans

### Abdelazzez - 4-Week Fitness Transformation Plan

- **Age**: 23 (Bio-Age: 31)
- **Visceral Fat Index**: 14.9 → Target: Under 9
- **Focus**: Body recomposition with 4-day upper/lower split
- **Protocol**: Intermediate strength + hypertrophy training

[View Abdelazzez's Plan](./Abdelaziz-Fitness-Plan/) | [Live on GitHub Pages](https://qs3h.github.io/Prime-Vanguard-Fitness-Plans/Abdelaziz-Fitness-Plan/)

### Abdulrahman - 4-Week Fitness Transformation Plan

- **Starting Weight**: 105.0 kg
- **4-Week Target**: 100-101 kg
- **Long-Term Goal**: 88.4 kg
- **Focus**: Body recomposition (lose fat, preserve/build muscle)

[View Abdulrahman's Plan](./Abdulrahman-Fitness-Plan/) | [Live on GitHub Pages](https://qs3h.github.io/Prime-Vanguard-Fitness-Plans/Abdulrahman-Fitness-Plan/)

## Features

### Workout Tracking

- Click checkmarks to mark exercises complete
- Progress bars update automatically
- Reset progress with one click
- Weight logging for each exercise

### Data Management

- **Sync**: Save progress to browser local storage
- **Export**: Download progress as JSON for backup
- **Import**: Load previously exported progress files

### Customization

- Exercise names are editable inline
- Changes save automatically
- Personalized meal plans and macros

## Training Philosophy

### Why Full Body Workouts?

Full body training 3x/week is optimal for transformation because:

- Maximizes fat loss through greater muscle engagement
- Faster skill learning with 3x/week practice
- Joint protection with lower per-session volume
- Hormonal optimization through compound lifts

### The 5 Non-Negotiable Rules

1. **Form Over Ego**: Perfect technique is non-negotiable
2. **Progressive Overload**: Add 1-2 reps or increase weight weekly
3. **Rest Periods**: 60-90 seconds between sets
4. **Hydration**: 4 liters of water daily
5. **Consistency**: Never miss two workouts in a row

## How to Use

### Quick Start

1. Navigate to a specific member's plan folder (e.g., `Abdulrahman-Fitness-Plan/`)
2. Open `index.html` in any modern web browser
3. Navigate through sections using the top navigation bar
4. Track workouts by clicking exercises to mark them complete
5. Enter weights used for each exercise
6. Use the **Sync** button to save your progress

### Browser Compatibility

Works in all modern browsers:

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Local Storage

Progress data is stored in the browser's local storage. Clearing browser data will reset progress—use the Export feature to create backups.

### Printing

Each plan is print-optimized. Use the **Print** button in the navigation to generate a PDF or physical copy.

## Adding a New Plan

To add a new fitness plan for a member:

1. Create a new folder in the root directory: `[MemberName]-Fitness-Plan/`
2. Copy the structure from an existing plan
3. Customize the HTML with member-specific data (weight, goals, InBody stats)
4. Adjust the nutrition plan and meal preferences
5. Update the README.md in the new plan folder
6. Add the plan to this repository's README.md

## Technical Stack

- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure JavaScript for interactivity
- **Local Storage API**: Client-side data persistence
- **FontSource Inter**: Typography via CDN

## Support

For questions about exercises, form, or nutrition guidance, consult with a certified fitness professional or the Prime Vanguard community.

## Disclaimer

These fitness plans are designed for educational purposes. Consult with a healthcare professional before starting any new exercise or nutrition program, especially if you have pre-existing health conditions.

---

**Prime Vanguard - Physical Mastery Brotherhood**

_"Excellence is not an act, but a habit"_
