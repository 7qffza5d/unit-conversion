// Cache for loaded unit data
const unitCache = {};
const temporaryUnits = {}; // Store prefix-generated units
let currentUnits = null;
let currentModalTarget = null; // 'from' or 'to'
let selectedFromUnit = null;
let selectedToUnit = null;
let selectedUnitForPrefix = null;
let showingPrefixes = false;
let prefixData = null;
let systemData = null;

// Load units from JSON file
async function loadCategory(category) {
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

async function loadSystems() {
    if (systemData) {
        return systemData;
    }
    
    try {
        const response = await fetch('data/systems.json');
        if (!response.ok) {
            throw new Error('Failed to load systems.json');
        }
        systemData = await response.json();
        return systemData;
    } catch (error) {
        console.error('Error loading systems:', error);
        return null;
    }
}

// Convert between units using factor and offset (with fraction support)
function convert(value, fromUnit, toUnit, units) {
    // Get unit data - either from units object or from stored selection
    const fromUnitData = units[fromUnit] || (fromUnit === selectedFromUnit ? temporaryUnits[fromUnit] : null);
    const toUnitData = units[toUnit] || (toUnit === selectedToUnit ? temporaryUnits[toUnit] : null);
    
    if (!fromUnitData || !toUnitData) {
        console.error('Unit not found:', fromUnit, toUnit);
        return 0;
    }
    
    // Get factors (support both decimal and fraction)
    const fromFactor = fromUnitData.factorNum ? 
        fromUnitData.factorNum / fromUnitData.factorDen : 
        fromUnitData.factor || 1;
    
    const toFactor = toUnitData.factorNum ? 
        toUnitData.factorNum / toUnitData.factorDen : 
        toUnitData.factor || 1;
    
    const fromOffset = fromUnitData.offset || 0;
    const toOffset = toUnitData.offset || 0;
    
    // Convert to SI
    const siValue = (value + fromOffset) * fromFactor;
    
    // Convert from SI to target
    const result = (siValue / toFactor) - toOffset;
    
    return result;
}

// Open unit selection modal
function openUnitModal(target) {
    currentModalTarget = target;
    const modal = document.getElementById('unitModal');
    const searchBox = document.getElementById('unitSearch');
    
    modal.classList.add('show');
    searchBox.value = '';
    searchBox.focus();
    
    renderUnitList();
}

// Close unit selection modal
function closeUnitModal() {
    const modal = document.getElementById('unitModal');
    modal.classList.remove('show');
}

// Render unit list in modal
async function renderUnitList(searchTerm = '') {
    const unitList = document.getElementById('unitList');
    unitList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
    
    if (!currentUnits) return;
    
    const systems = await loadSystems();
    unitList.innerHTML = '';
    
    const selectedUnit = currentModalTarget === 'from' ? selectedFromUnit : selectedToUnit;
    
    // Group units by system
    const unitsBySystem = {};
    
    for (const [key, unit] of Object.entries(currentUnits)) {
        // Filter by search term
        if (searchTerm && !unit.name.toLowerCase().includes(searchTerm.toLowerCase()) 
            && !unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
            continue;
        }
        
        const system = unit.system || 'Other';
        if (!unitsBySystem[system]) {
            unitsBySystem[system] = [];
        }
        unitsBySystem[system].push({ key, unit });
    }
    
    // Render each system section
    for (const [systemKey, units] of Object.entries(unitsBySystem)) {
        const systemInfo = systems?.[systemKey] || { name: systemKey, description: '' };
        
        const systemSection = document.createElement('div');
        systemSection.className = 'system-section';
        
        const systemHeader = document.createElement('div');
        systemHeader.className = 'system-header';
        if (systemInfo.color) {
            systemHeader.style.background = systemInfo.color;
        }
        systemHeader.innerHTML = `
            <div class="system-header-left">
                <span class="collapse-icon">▼</span>
                <div class="system-name">${systemInfo.name}</div>
            </div>
            ${systemInfo.description ? `
                <div class="system-info-icon">
                    ?
                    <div class="system-tooltip">${systemInfo.description}</div>
                </div>
            ` : ''}
        `;

        // Add click handler for collapsing
        systemHeader.addEventListener('click', (e) => {
            // Don't collapse if clicking the info icon
            if (e.target.closest('.system-info-icon')) {
                return;
            }
    
            const collapseIcon = systemHeader.querySelector('.collapse-icon');
            systemUnitsDiv.classList.toggle('collapsed');
            collapseIcon.classList.toggle('collapsed');
        });
        
        const systemUnitsDiv = document.createElement('div');
        systemUnitsDiv.className = 'system-units';
        
        // Add units for this system
        for (const { key, unit } of units) {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-card';
            if (key === selectedUnit) {
                unitCard.classList.add('selected');
            }
            
            const iconText = unit.symbol.length <= 3 ? unit.symbol : unit.name.charAt(0);
            
            unitCard.innerHTML = `
                <div class="unit-card-header">
                    <div class="unit-icon">${iconText}</div>
                    <div class="unit-card-title">
                        <div class="unit-name">${unit.name}</div>
                        <div class="unit-symbol">${unit.symbol}</div>
                    </div>
                </div>
                <button class="add-prefix-btn">+ Prefix</button>
                ${unit.description ? `<div class="unit-info">${unit.description}</div>` : ''}
            `;
            
            systemUnitsDiv.appendChild(unitCard);
            
            // Add event listeners
            const prefixBtn = unitCard.querySelector('.add-prefix-btn');
            prefixBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePrefixView(key);
            });
            
            unitCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-prefix-btn')) {
                    selectUnit(key, unit);
                }
            });
        }
        
        systemSection.appendChild(systemHeader);
        systemSection.appendChild(systemUnitsDiv);
        unitList.appendChild(systemSection);
    }
}

// Select a unit from modal
function selectUnit(key, unit) {
    if (currentModalTarget === 'from') {
        selectedFromUnit = key;
        document.getElementById('fromUnitDisplay').textContent = `${unit.name} (${unit.symbol})`;
    } else {
        selectedToUnit = key;
        document.getElementById('toUnitDisplay').textContent = `${unit.name} (${unit.symbol})`;
    }
    
    closeUnitModal();
    updateConversion();
}

// Update conversion result
function updateConversion() {
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const toValueInput = document.getElementById('toValue');
    const resultDiv = document.getElementById('result');
    
    if (isNaN(fromValue) || !selectedFromUnit || !selectedToUnit) {
        toValueInput.value = '';
        resultDiv.classList.remove('show');
        return;
    }
    
    // Combine current units with temporary units
    const allUnits = { ...currentUnits, ...temporaryUnits };
    
    const result = convert(fromValue, selectedFromUnit, selectedToUnit, allUnits);
    const formattedResult = result.toFixed(6).replace(/\.?0+$/, '');
    
    toValueInput.value = formattedResult;
    
    const fromUnitData = allUnits[selectedFromUnit];
    const toUnitData = allUnits[selectedToUnit];
    
    resultDiv.textContent = `${fromValue} ${fromUnitData.symbol} = ${formattedResult} ${toUnitData.symbol}`;
    resultDiv.classList.add('show');
}

// Swap units
function swapUnits() {
    const temp = selectedFromUnit;
    selectedFromUnit = selectedToUnit;
    selectedToUnit = temp;
    
    if (selectedFromUnit && currentUnits[selectedFromUnit]) {
        document.getElementById('fromUnitDisplay').textContent = 
            `${currentUnits[selectedFromUnit].name} (${currentUnits[selectedFromUnit].symbol})`;
    }
    
    if (selectedToUnit && currentUnits[selectedToUnit]) {
        document.getElementById('toUnitDisplay').textContent = 
            `${currentUnits[selectedToUnit].name} (${currentUnits[selectedToUnit].symbol})`;
    }
    
    const fromValue = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue');
    fromValue.value = toValue.value || '1';
    
    updateConversion();
}

// Load prefixes from JSON
async function loadPrefixes() {
    if (prefixData) {
        return prefixData;
    }
    
    try {
        const response = await fetch('data/prefixes.json');
        if (!response.ok) {
            throw new Error('Failed to load prefixes.json');
        }
        prefixData = await response.json();
        return prefixData;
    } catch (error) {
        console.error('Error loading prefixes:', error);
        alert('Error loading prefixes. Please check that prefixes.json exists.');
        return null;
    }
}

// Toggle prefix selection view
function togglePrefixView(unitKey) { 
    const prefixModal = document.getElementById('prefixModal');
    const unitList = document.getElementById('unitList');
    
    if (showingPrefixes && selectedUnitForPrefix === unitKey) {
        // Hide prefix view
        prefixModal.classList.remove('show');
        unitList.style.display = 'grid';
        showingPrefixes = false;
        selectedUnitForPrefix = null;
    } else {
        // Show prefix view
        selectedUnitForPrefix = unitKey;
        showingPrefixes = true;
        renderPrefixOptions(unitKey);
        prefixModal.classList.add('show');
        unitList.style.display = 'none';
    }
}

// Render prefix options
async function renderPrefixOptions(unitKey) {
    const unit = currentUnits[unitKey];
    const prefixGrid = document.getElementById('prefixGrid');
    prefixGrid.innerHTML = '<div style="text-align: center; padding: 20px;">Loading prefixes...</div>';
    
    const prefixes = await loadPrefixes();
    if (!prefixes) return;
    
    prefixGrid.innerHTML = '';
    
    for (const [prefixKey, prefix] of Object.entries(prefixes)) {
        const prefixOption = document.createElement('div');
        prefixOption.className = 'prefix-option';
        
        prefixOption.innerHTML = `
            <div class="prefix-name">${prefix.symbol}</div>
            <div class="prefix-value">${prefix.name}</div>
        `;
        
        prefixOption.addEventListener('click', () => {
            applyPrefix(unitKey, prefix.name, prefix);
        });
        
        prefixGrid.appendChild(prefixOption);
    }
}

// Apply prefix to unit
function applyPrefix(unitKey, prefixName, prefix) {
    const unit = currentUnits[unitKey];
    
    const newUnitKey = unitKey + '_' + prefixName;
    
    // Create new unit with prefix applied
    const newUnit = {
        factor: unit.factor * prefix.factor,
        offset: unit.offset || 0,
        symbol: prefix.symbol + unit.symbol,
        name: prefixName + unit.name.toLowerCase(),
        system: unit.system,
        description: `${prefix.factor} ${unit.name.toLowerCase()}s`
    };
    
    // Handle fractional factors
    if (unit.factorNum && unit.factorDen) {
        newUnit.factorNum = unit.factorNum * prefix.factor;
        newUnit.factorDen = unit.factorDen;
        delete newUnit.factor;
    }
    
    // Store in temporary units
    temporaryUnits[newUnitKey] = newUnit;
    
    // Select this new unit
    selectUnit(newUnitKey, newUnit);
    
    // Hide prefix view
    const prefixModal = document.getElementById('prefixModal');
    prefixModal.classList.remove('show');
    document.getElementById('unitList').style.display = 'grid';
    showingPrefixes = false;
}

// Initialize app
async function init() {
    const categorySelect = document.getElementById('category');
    const loadingDiv = document.getElementById('loading');
    
    // Load initial category
    loadingDiv.style.display = 'block';
    currentUnits = await loadCategory(categorySelect.value);
    loadingDiv.style.display = 'none';
    
    if (currentUnits) {
        // Set default units
        const unitKeys = Object.keys(currentUnits);
        selectedFromUnit = unitKeys[0];
        selectedToUnit = unitKeys[1] || unitKeys[0];
        
        document.getElementById('fromUnitDisplay').textContent = 
            `${currentUnits[selectedFromUnit].name} (${currentUnits[selectedFromUnit].symbol})`;
        document.getElementById('toUnitDisplay').textContent = 
            `${currentUnits[selectedToUnit].name} (${currentUnits[selectedToUnit].symbol})`;
        
        updateConversion();
    }

    
    
    // Event listeners
    categorySelect.addEventListener('change', async (e) => {
        loadingDiv.style.display = 'block';
        currentUnits = await loadCategory(e.target.value);
        loadingDiv.style.display = 'none';
        
        if (currentUnits) {
            const unitKeys = Object.keys(currentUnits);
            selectedFromUnit = unitKeys[0];
            selectedToUnit = unitKeys[1] || unitKeys[0];
            
            document.getElementById('fromUnitDisplay').textContent = 
                `${currentUnits[selectedFromUnit].name} (${currentUnits[selectedFromUnit].symbol})`;
            document.getElementById('toUnitDisplay').textContent = 
                `${currentUnits[selectedToUnit].name} (${currentUnits[selectedToUnit].symbol})`;
            
            updateConversion();
        }
    });
    
    document.getElementById('fromValue').addEventListener('input', updateConversion);
    document.getElementById('swapBtn').addEventListener('click', swapUnits);
    
    // Unit selector buttons
    document.getElementById('fromUnitBtn').addEventListener('click', () => openUnitModal('from'));
    document.getElementById('toUnitBtn').addEventListener('click', () => openUnitModal('to'));
    
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeUnitModal);
    document.getElementById('unitModal').addEventListener('click', (e) => {
        if (e.target.id === 'unitModal') {
            closeUnitModal();
        }
    });
    
    // Search functionality
    document.getElementById('unitSearch').addEventListener('input', (e) => {
        renderUnitList(e.target.value);
    });
    
    // Keyboard shortcut to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUnitModal();
        }
    });
    
    await loadPrefixes(); // Preload prefixes
    await loadSystems(); // Preload systems
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', init);