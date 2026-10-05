let canvas, ctx;
let isDrawing = false;
let activePageIndex = 0;
let currentUtterance = null;

let notebookData = [
    { artifactName: 'Opportunity Rover (Oppy)', planetaryBody: 'Mars - Perseverance Valley Site', operationalDates: 'Jan 2004 - June 2018', hardwareStatus: 'decommissioned', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://nasa.gov' },
    { artifactName: 'Apollo 11 ALSEP Arrays', planetaryBody: 'Lunar Surface - Mare Tranquillitatis', operationalDates: 'July 1969 - Dec 1975', hardwareStatus: 'decommissioned', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://nasa.gov' },
    { artifactName: 'Voyager 1 Deep Space Link', planetaryBody: 'Deep Interstellar Space Trajectory', operationalDates: 'Sept 1977 - Operations Active', hardwareStatus: 'active-silent', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://nasa.gov' },
    { artifactName: 'Spirit Rover (MER-A)', planetaryBody: 'Mars - Gusev Crater Matrix', operationalDates: 'Jan 2004 - March 2010', hardwareStatus: 'decommissioned', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://nasa.gov' },
    { artifactName: 'Mars 3 Lander Pod assembly', planetaryBody: 'Mars Surface - Propontis I Sector', operationalDates: 'Dec 1971 - Dec 1971 (14 Seconds)', hardwareStatus: 'impacted', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://noaa.gov' },
    { artifactName: 'Apollo Lunar Module Descent Stage', planetaryBody: 'Lunar Crust Highlands Sectors', operationalDates: '1969 - 1972 missions', hardwareStatus: 'decommissioned', environmentalImpact: '', historicalNarrative: '', canvasImg: '', uploadedImg: '', interactiveUrl: 'https://nasa.gov' }
];

const historicalIntel = [
    { summary: "<strong>ARCHIVAL DATA // OPPORTUNITY:</strong> Landed in Eagle Crater in 2004. Explored for 14 years before a massive planetary dust storm blocked its solar arrays in 2018. <em>Telemetry Risks:</em> Vulnerable to extreme Martian dust coatings and severe thermal cycling from day-to-night transitions." },
    { summary: "<strong>ARCHIVAL DATA // APOLLO 11 ALSEP:</strong> The Apollo Lunar Surface Experiments Package contained technical sensors to measure moonquakes, solar wind particles, and mapping data. <em>Telemetry Risks:</em> Unbuffered components have faced direct bombardment by energetic solar protons and galactic cosmic rays outside Earth's magnetic shielding." },
    { summary: "<strong>ARCHIVAL DATA // VOYAGER 1:</strong> Launched in 1977, it entered interstellar space in 2012. It tracks remote magnetic alignments billions of miles away. <em>Telemetry Risks:</em> Cosmic ray exposure frequently alters memory storage bits, causing Single-Event Upsets (SEUs) that garble diagnostic code transmissions." },
    { summary: "<strong>ARCHIVAL DATA // SPIRIT ROVER:</strong> The twin to Opportunity, Spirit explored Gusev Crater. It became trapped in soft Martian sands at a site named 'Trojan Horse' in 2009, preventing optimal solar panel alignment for the winter freeze. <em>Telemetry Risks:</em> Complete internal electronics freezing due to loss of operational heater power." },
    { summary: "<strong>ARCHIVAL DATA // MARS 3 LANDER:</strong> An early Soviet spacecraft that achieved the first successful soft landing on Mars in 1971. It abruptly stopped transmitting telemetry after 14 seconds. <em>Telemetry Risks:</em> Suspected onboard systems failure triggered by a severe, planet-wide dust storm during deployment." },
    { summary: "<strong>ARCHIVAL DATA // APOLLO DESCENT STAGES:</strong> Six cast-iron and aluminum structural platforms remain at landing sites across the Moon. They served as launchpads for returning lunar astronauts. <em>Telemetry Risks:</em> Long-term degradation from micro-meteorite strikes and unfiltered ultraviolet solar radiation exposure." }
];

window.onload = () => {
    canvas = document.getElementById('artifactCanvas');
    ctx = canvas.getContext('2d');
    setupCanvasInputEngine();
    loadWorkbookFromCache();
};

function setupCanvasInputEngine() {
    ctx.strokeStyle = '#c96f18';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const getScaledPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches.clientX : e.clientX;
        const clientY = e.touches ? e.touches.clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDraw = (e) => { isDrawing = true; ctx.beginPath(); draw(e); };
    const draw = (e) => {
        if (!isDrawing) return;
        const pos = getScaledPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };
    const stopDraw = () => { if (isDrawing) { isDrawing = false; cacheCanvasState(); updateChecklist(); } };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    canvas.addEventListener('touchstart', (e) => { startDraw(e); e.preventDefault(); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { draw(e); e.preventDefault(); }, {passive: false});
    canvas.addEventListener('touchend', stopDraw);
}

function toggleAudioLog() {
    const btn = document.getElementById('audioLogBtn');
    
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btn.innerText = "📻 Play Audio Log";
        btn.classList.remove('playing');
        return;
    }

    const rawHTML = historicalIntel[activePageIndex].summary;
    let cleanText = rawHTML.replace(/<\/?[^>]+(>|$)/g, "");

    cleanText = cleanText.replace(/\. /g, "... [BZZZT] ... TRANSMISSION CORRUPTION... ");
    cleanText = cleanText.replace(/, /g, "... [KRRRXT] ... ");

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    const availableVoices = window.speechSynthesis.getVoices();
    const optimalRoboticVoice = availableVoices.find(voice => 
        voice.name.includes('Google US English') || voice.name.includes('David') || voice.name.includes('Male') || voice.lang.startsWith('en')
    );

    if (optimalRoboticVoice) currentUtterance.voice = optimalRoboticVoice;
    currentUtterance.pitch = 0.35;
    currentUtterance.rate = 0.82; 
    
    currentUtterance.onend = () => {
        btn.innerText = "📻 Play Audio Log";
        btn.classList.remove('playing');
    };

    btn.innerText = "🛑 Abort Feed";
    btn.classList.add('playing');
    window.speechSynthesis.speak(currentUtterance);
}

function loadDefaultTemplate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
    ctx.lineWidth = 1.5;

    if (activePageIndex === 0 || activePageIndex === 3) {
        ctx.strokeRect(120, 100, 160, 70);
        ctx.beginPath(); ctx.arc(140, 180, 12, 0, Math.PI*2); ctx.arc(200, 180, 12, 0, Math.PI*2); ctx.arc(260, 180, 12, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(150, 100); ctx.lineTo(150, 40); ctx.stroke();
    } else if (activePageIndex === 1) {
        ctx.strokeRect(130, 90, 140, 80); ctx.strokeRect(160, 105, 80, 50);
    } else if (activePageIndex === 2) {
        ctx.beginPath(); ctx.arc(200, 115, 65, 0, Math.PI, true); ctx.stroke(); ctx.strokeRect(185, 115, 30, 40);
    } else if (activePageIndex === 4) {
        ctx.beginPath(); ctx.arc(200, 130, 40, 0, Math.PI*2); ctx.stroke();
        for(let i=0; i<4; i++) { ctx.strokeRect(140 + (i*30), 80, 20, 30); }
    } else if (activePageIndex === 5) {
        ctx.strokeRect(110, 120, 180, 60);
        ctx.beginPath(); ctx.moveTo(110, 180); ctx.lineTo(80, 210); ctx.moveTo(290, 180); ctx.lineTo(320, 210); ctx.stroke();
    }
    ctx.restore();
    cacheCanvasState();
}

function updateChecklist() {
    const student = document.getElementById('studentName').value.trim();
    const timeline = document.getElementById('operationalDates').value.trim();
    const weather = document.getElementById('environmentalImpact').value.trim();
    const narrative = document.getElementById('historicalNarrative').value.trim();
    const currentRecord = notebookData[activePageIndex];

    let itemsChecked = 0;

    const evalItem = (id, condition) => {
        const target = document.getElementById(id);
        if (condition) {
            target.innerHTML = `<span class="status-icon">✅</span> ` + target.innerText.substring(2);
            target.classList.add('valid');
            itemsChecked++;
        } else {
            target.innerHTML = `<span class="status-icon">❌</span> ` + target.innerText.substring(2);
            target.classList.remove('valid');
        }
    };

    evalItem('chkHistorian', student.length > 2);
    evalItem('chkTimeline', timeline.length > 2);
    evalItem('chkVisual', currentRecord.canvasImg && currentRecord.canvasImg.length > 2000);
    evalItem('chkWeather', weather.length > 15);
    evalItem('chkNarrative', narrative.length > 25);

    const scorePct = Math.round((itemsChecked / 5) * 100);
}

document.getElementById('totalCompletion').innerHTML = `Current Page Readiness Status: <span style="color: ${scorePct === 100 ? 'var(--success-green)' : 'var(--alert-red)'}"><strong>${scorePct}%</strong></span>`;

function saveCurrentData() {
    notebookData[activePageIndex].operationalDates = document.getElementById('operationalDates').value;
    notebookData[activePageIndex].hardwareStatus = document.getElementById('hardwareStatus').value;
    notebookData[activePageIndex].environmentalImpact = document.getElementById('environmentalImpact').value;
    notebookData[activePageIndex].historicalNarrative = document.getElementById('historicalNarrative').value;
    localStorage.setItem('nasa_log_student_name', document.getElementById('studentName').value);
    localStorage.setItem('nasa_log_notebook_matrix', JSON.stringify(notebookData));
}

function cacheCanvasState() {
    notebookData[activePageIndex].canvasImg = canvas.toDataURL();
    localStorage.setItem('nasa_log_notebook_matrix', JSON.stringify(notebookData));
}

function handleImageUpload(event) {
    const file = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        notebookData[activePageIndex].uploadedImg = e.target.result;
        renderImageFrame(e.target.result);
        localStorage.setItem('nasa_log_notebook_matrix', JSON.stringify(notebookData));
    };
    reader.readAsDataURL(file);
}

function renderImageFrame(base64Data) {
    const frame = document.getElementById('photoPreview');
    const container = document.getElementById('mediaDisplayContainer');
    if (base64Data) {
        container.classList.add('photo-active');
        frame.innerHTML = `<img src="${base64Data}" class="uploaded-img" alt="Archival Entry">`;
    } else {
        container.classList.remove('photo-active');
        frame.innerHTML = '';
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    notebookData[activePageIndex].canvasImg = '';
    localStorage.setItem('nasa_log_notebook_matrix', JSON.stringify(notebookData));
    updateChecklist();
}

function switchArtifact(pageIndex) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const audioBtn = document.getElementById('audioLogBtn');
    audioBtn.innerText = "📻 Play Audio Log";
    audioBtn.classList.remove('playing');
    
    saveCurrentData();
    activePageIndex = pageIndex;
    
    const tabs = document.querySelectorAll('#tabContainer .tab-btn');
    tabs.forEach((tab, index) => tab.classList.toggle('active', index === pageIndex));
    
    const data = notebookData[pageIndex];
    document.getElementById('artifactName').value = data.artifactName || '';
    document.getElementById('planetaryBody').value = data.planetaryBody || '';
    document.getElementById('operationalDates').value = data.operationalDates || '';
    document.getElementById('hardwareStatus').value = data.hardwareStatus || 'decommissioned';
    document.getElementById('environmentalImpact').value = data.environmentalImpact || '';
    document.getElementById('historicalNarrative').value = data.historicalNarrative || '';
    document.getElementById('archivalIntel').innerHTML = historicalIntel[pageIndex].summary;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.canvasImg) {
        const matrixImage = new Image();
        matrixImage.onload = () => ctx.drawImage(matrixImage, 0, 0);
        matrixImage.src = data.canvasImg;
    } else {
        loadDefaultTemplate();
    }
    
    const container = document.getElementById('mediaDisplayContainer');
    const iframe = document.getElementById('nasaInteractiveFrame');
    if (data.uploadedImg) {
        container.classList.add('photo-active');
        document.getElementById('photoPreview').innerHTML = `<img src="${data.uploadedImg}" class="uploaded-img" alt="Archival Entry">`;
    } else {
        container.classList.remove('photo-active');
        document.getElementById('photoPreview').innerHTML = '';
        iframe.src = data.interactiveUrl || "about:blank";
    }
    
    document.getElementById('imageUpload').value = '';
    document.getElementById('logId').value = `RECORD-SECTOR-0${pageIndex + 1}`;
    setTimeout(updateChecklist, 50);
}

function loadWorkbookFromCache() {
    const savedStudent = localStorage.getItem('nasa_log_student_name');
    if (savedStudent) document.getElementById('studentName').value = savedStudent;
    const savedMatrixData = localStorage.getItem('nasa_log_notebook_matrix');
    if (savedMatrixData) notebookData = JSON.parse(savedMatrixData);
    switchArtifact(0);
}

function exportToCSV() {
    saveCurrentData();
    const student = document.getElementById('studentName').value || 'Cadet_Historian';
    let entries = [['2026 NASA Space Apps Discarded Artifact Log Sheet Matrix'], [`Reporting Space Historian: ${student}`], [], ['Log Sector ID', 'Artifact Name', 'Planetary Location', 'Operational Duration', 'Status State', 'Space Weather Corrosion Notes', 'Historical Narrative Legacy']];
    
    notebookData.forEach((record, index) => {
        entries.push([`Sector 0${index + 1}`, `"${record.artifactName}"`, `"${record.planetaryBody}"`, `"${record.operationalDates}"`, record.hardwareStatus, `"${record.environmentalImpact.replace(/"/g, '""')}"`, `"${record.historicalNarrative.replace(/"/g, '""')}"`]);
    });
    
    const csvBody = "data:text/csv;charset=utf-8," + entries.map(row => row.join(',')).join('\n');
    const encodedTargetUri = encodeURI(csvBody);
    const hiddenTrigger = document.createElement("a");
    hiddenTrigger.setAttribute("href", encodedTargetUri);
    hiddenTrigger.setAttribute("download", `NASA_SpaceApps_Workbook_${student.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(hiddenTrigger);
    hiddenTrigger.click();
    document.body.removeChild(hiddenTrigger);
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}
