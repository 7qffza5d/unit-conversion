# Unit Converter

A modern, comprehensive unit conversion tool with support for multiple measurement systems, metric prefixes, and an intuitive modal-based interface.

## Features

### 🔄 Comprehensive Unit Support
- **Length**: meters, kilometers, miles, feet, inches, and more
- **Mass**: kilograms, grams, pounds, ounces, and more
- **Volume**: liters, milliliters, gallons, cups, and more
- **Temperature**: Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton

### ⚡ Dynamic Prefix System
- Add metric prefixes (kilo-, mega-, milli-, micro-, etc.) to any unit on the fly
- 20 standard metric prefixes from yocto (10⁻²⁴) to yotta (10²⁴)
- No need to pre-define every possible combination

### 🎨 Modern UI/UX
- Beautiful modal-based unit selection
- Search functionality to quickly find units
- Units organized by system (Metric, Imperial, Historical, etc.)
- Collapsible system sections with descriptions
- Hover tooltips for additional information
- Smooth animations and transitions

### 🔧 Technical Features
- **JSON-based architecture**: All units, prefixes, and system descriptions stored in easy-to-edit JSON files
- **Factor + Offset conversion**: Accurate conversions for both linear and offset-based units (like temperature)
- **Fractional factors**: Support for precise conversions using numerator/denominator (e.g., 5/9 for Fahrenheit)
- **Client-side caching**: Units load once and are cached for performance
- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS

## File Structure

```
unit-converter/
│
├── index.html              # Main HTML file
├── style.css               # All styling
├── app.js                  # Core application logic
│
└── data/                   # JSON data files
    ├── length.json         # Length units
    ├── mass.json           # Mass units
    ├── volume.json         # Volume units
    ├── temperature.json    # Temperature units
    ├── prefixes.json       # Metric prefixes
    └── systems.json        # System descriptions
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/unit-converter.git
   cd unit-converter
   ```

2. **Run a local server**
   
   Since the app loads JSON files, you need to run it through a local server (browsers block local file access for security).
   
   **Using Python:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Node.js:**
   ```bash
   npx http-server
   ```
   
   **Using VS Code:**
   - Install the "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## Usage

### Basic Conversion
1. Select a category (Length, Mass, Volume, Temperature)
2. Click the "From" unit button to select your source unit
3. Enter a value
4. Click the "To" unit button to select your target unit
5. The result appears automatically

### Adding Prefixes
1. Open the unit selection modal
2. Click the "+ Prefix" button on any unit
3. Select a metric prefix (kilo, mega, milli, etc.)
4. The prefixed unit is immediately available for conversion

### Searching Units
- Use the search box in the unit selection modal
- Search by unit name or symbol
- Results update in real-time

### Collapsible Systems
- Click on any system header to collapse/expand that section
- Hover over the "?" icon to see system descriptions

## Adding New Units

Units are stored in JSON files in the `data/` folder. To add a new unit:

### Example: Adding a new length unit

Edit `data/length.json`:
```json
{
  "furlong": {
    "factor": 201.168,
    "offset": 0,
    "symbol": "fur",
    "name": "Furlong",
    "system": "Imperial",
    "description": "One eighth of a mile, used in horse racing"
  }
}
```

### JSON Fields:
- `factor`: Conversion factor to the SI base unit (required)
- `offset`: Offset for non-linear conversions like temperature (default: 0)
- `symbol`: Unit symbol (optional but recommended)
- `name`: Full unit name (required)
- `system`: System category (e.g., "Metric", "Imperial")
- `description`: Additional information (optional)

### For Temperature Units:
Use `factorNum` and `factorDen` for precise fractional conversions:
```json
{
  "fahrenheit": {
    "factorNum": 9,
    "factorDen": 5,
    "offset": 32,
    "symbol": "°F",
    "name": "Fahrenheit",
    "system": "Imperial"
  }
}
```

## Adding New Categories

1. Create a new JSON file in `data/` (e.g., `data/energy.json`)
2. Add units following the format above
3. Add the category to the dropdown in `index.html`:
   ```html
   <option value="energy">Energy</option>
   ```

## Adding New Systems

Edit `data/systems.json`:
```json
{
  "YourSystem": {
    "name": "Your System Name",
    "description": "Description of this measurement system",
    "color": "#hexcolor"
  }
}
```

## How It Works

### Conversion Algorithm

All conversions go through the SI base unit as an intermediary:

```
Input Value → SI Base Unit → Output Value
```

**Formula:**
```javascript
SI_Value = (input + offset_from) × factor_from
Output = (SI_Value ÷ factor_to) - offset_to
```

**Example: 5 feet to meters**
```
SI_Value = (5 + 0) × 0.3048 = 1.524 meters
Output = (1.524 ÷ 1) - 0 = 1.524 meters
```

**Example: 25°C to Fahrenheit**
```
SI_Value = (25 + 0) × 1 = 25°C (base unit)
Output = (25 × 9/5) - (-32) = 77°F
```

### Prefix System

When you add a prefix, the app:
1. Takes the base unit's factor
2. Multiplies by the prefix factor
3. Creates a temporary unit with the combined factor
4. Stores it for the current session

**Example: Adding "kilo" to "meter"**
```
Base: meter (factor: 1)
Prefix: kilo (factor: 1000)
Result: kilometer (factor: 1000)
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ support

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add your units/features
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### What to Contribute:
- New units in existing categories
- New categories (pressure, energy, etc.)
- UI improvements
- Bug fixes
- Documentation improvements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with vanilla JavaScript - no frameworks needed
- Inspired by the need for a flexible, extensible unit converter
- Unit data sourced from NIST and other scientific standards and historical records

## Roadmap

- [ ] Add more categories (pressure, energy, power, etc.)
- [ ] Custom unit creation
- [ ] Conversion history
- [ ] Favorite units
- [ ] Dark mode
- [ ] Mobile app version
- [ ] Multi-step conversions
- [ ] Unit comparison mode

## Contact

Krit Kutawan - [@kritkutawan](https://www.instagram.com/kritkutawan/)

Project Link: [https://github.com/7qffza5d/unit-conversion](https://github.com/7qffza5d/unit-conversion)

---

Made with ❤️ and a lot of JSON