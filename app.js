// Cache for loaded unit data
const unitCache = {};

// Load units from JSON file
async function loadCategory(category) {
    // Check cache first
    if (unitCache[category]) {
        return unitCache[category];
    }

    try {
        const response = await fetch(`data/${category}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${category}.json`);
        }
        const data = await response.json();
        unitCache[category] = data;
        return data;
    } catch (error) {
        console.error('Error loading units:', error);
        alert(`Error loading ${category} units. Please check that the JSON file exists.`);
        return null;
    }
}

// Convert between units
function convert(value, fromUnit, toUnit, units, category) {
    if (category === 'temperature') {
        // Temperature uses special conversion functions
        const siValue = units[fromUnit].toSI(value);
        return units[toUnit].fromSI(siValue);
    } else {
        // Regular units use factors
        const siValue = value * units[fromUnit].factor;
        return siValue / units[toUnit].factor;
    }
}

// Populate unit dropdowns
function populateUnits(units) {
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    for (const [key, unit] of Object.entries(units)) {
        const option1 = document.createElement('option');
        option1.value = key;
        option1.textContent = `${unit.name} (${unit.symbol})`;
        fromSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = key;
        option2.textContent = `${unit.name} (${unit.symbol})`;
        toSelect.appendChild(option2);
    }
    
    // Set default selections
    if (toSelect.options.length > 1) {
        toSelect.selectedIndex = 1;
    }
}

// Update conversion result
function updateConversion() {
    const category = document.getElementById('category').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    const toValueInput = document.getElementById('toValue');
    const resultDiv = document.getElementById('result');
    
    if (!unitCache[category] || isNaN(fromValue) || !fromUnit || !toUnit) {
        toValueInput.value = '';
        resultDiv.classList.remove('show');
        return;
    }
    
    const result = convert(fromValue, fromUnit, toUnit, unitCache[category], category);
    const formattedResult = result.toFixed(6).replace(/\.?0+$/, '');
    
    toValueInput.value = formattedResult;
    
    const fromUnitData = unitCache[category][fromUnit];
    const toUnitData = unitCache[category][toUnit];
    
    resultDiv.textContent = `${fromValue} ${fromUnitData.symbol} = ${formattedResult} ${toUnitData.symbol}`;
    resultDiv.classList.add('show');
}

// Swap units
function swapUnits() {
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    const fromValue = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue');
    
    const tempUnit = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempUnit;
    
    fromValue.value = toValue.value || '1';
    
    updateConversion();
}

// Initialize app
async function init() {
    const categorySelect = document.getElementById('category');
    const loadingDiv = document.getElementById('loading');
    
    // Load initial category
    loadingDiv.style.display = 'block';
    const units = await loadCategory(categorySelect.value);
    loadingDiv.style.display = 'none';
    
    if (units) {
        populateUnits(units);
        updateConversion();
    }
    
    // Event listeners
    categorySelect.addEventListener('change', async (e) => {
        loadingDiv.style.display = 'block';
        const units = await loadCategory(e.target.value);
        loadingDiv.style.display = 'none';
        
        if (units) {
            populateUnits(units);
            updateConversion();
        }
    });
    
    document.getElementById('fromValue').addEventListener('input', updateConversion);
    document.getElementById('fromUnit').addEventListener('change', updateConversion);
    document.getElementById('toUnit').addEventListener('change', updateConversion);
    document.getElementById('swapBtn').addEventListener('click', swapUnits);
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', init);