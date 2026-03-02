function addon_Main() {
    let page = document.URL.split('/').pop();
    let param = page.split('?').pop();
    
    if (page !== param) {
        page = page.split('?')[0];
    }
    else {
        param = false;
    }
    
    switch (page) {
        case('active_wave.php'):
            wave(param);
            break;
        default:
            break;
    }
}

function wave(wave) {
    let monsterData = getMonstersData();
    let caches = getCachedValues();
    monsterDisplayButtons(wave.split('&'), monsterData, caches);
    hideBossMonstersButton(monsterData, caches);
    hideLowHealthMonsterButton(monsterData, caches);
}

function getMonstersData() {
    let monsterList = document.querySelectorAll('div.monster-card');
    let monsterData = [];

    for (let i = 0; i < monsterList.length; i++) {
        let monsterName = monsterList[i].getElementsByTagName('h3')[0].innerHTML;
        let monsterHealth = monsterList[i].querySelector('div.monster-stats')
            .querySelector('div.stat-row')
            .querySelector('div.stat-main')
            .querySelector('div.stat-value').innerHTML;
        
        monsterHealth = monsterHealth.split('/');
        monsterHealth[0] = Number(monsterHealth[0].trim().replaceAll(',', ''));
        monsterHealth[1] = Number(monsterHealth[1].trim().replaceAll(',', ''));
        if (monsterHealth[1] > 1000000000) {
            monsterData.push({element: monsterList[i], name: monsterName, health: 0, hidden: false, type: "boss"});
        }
        else {
            monsterData.push({element: monsterList[i], name: monsterName, health: monsterHealth[0] / monsterHealth[1] , hidden: false, type: "normal"});
        }
        
    }
    monsterData.sort((monster_a, monster_b) => monster_a.health - monster_b.health);
    return monsterData;
}

function getCachedValues() {
    let lowHealthToHide = localStorage['f2p-addon:minPercentHealth'];
    if (lowHealthToHide) {
        lowHealthToHide = JSON.parse(lowHealthToHide);
    }
    else {
        localStorage['f2p-addon:minPercentHealth'] = JSON.stringify(0);
        lowHealthToHide = 0;
    }

    let hideBoss = localStorage['f2p-addon:hideBosses'];
    if (hideBoss) {
        hideBoss = JSON.parse(hideBoss);
    }
    else {
        localStorage['f2p-addon:hideBosses'] = JSON.stringify(false);
        hideBoss = false;
    }

    let hideMonsters = localStorage['f2p-addon:monstersBlacklist'];
    if (hideMonsters) {
        hideMonsters = JSON.parse(hideMonsters);
    }
    else {
        localStorage['f2p-addon:monstersBlacklist'] = JSON.stringify([])
        hideMonsters = []; 
    }
    return ({hideMonstersBelow: lowHealthToHide, bossHidden: hideBoss, monstersToHide: hideMonsters})

}

function hideLowHealthMonsterButton(monsterData, caches) {

    let btn = document.createElement('button');
    btn.classList.add("btn");
    if (caches.hideMonstersBelow === 0) {
        btn.style.backgroundColor = "green";
    }
    else if (caches.hideMonstersBelow === 10) {
        btn.style.backgroundColor = "red";
    }
    else if (caches.hideMonstersBelow === 25) {
        btn.style.backgroundColor = "#FF4433";
    }
    else if (caches.hideMonstersBelow === 50) {
        btn.style.backgroundColor = "orange";
    }
    else if (caches.hideMonstersBelow === 75) {
        btn.style.backgroundColor = "#7fd484";
    }
    else {
        return;
    }
    btn.innerText = "Hide monsters below " + caches.hideMonstersBelow + "% health";
    
    
    
    let buttonBox = document.createElement('div');
    buttonBox.appendChild(btn);
    btn.addEventListener('click', () => {
        if (caches.hideMonstersBelow === 10) {
            btn.style.backgroundColor = "#FF4433";
            caches.hideMonstersBelow = 25;
        }
        else if (caches.hideMonstersBelow === 25) {
            btn.style.backgroundColor = "orange";
            caches.hideMonstersBelow = 50;
        }
        else if (caches.hideMonstersBelow === 50) {
            btn.style.backgroundColor = "#7fd484";
            caches.hideMonstersBelow = 75;
        }
        else  if (caches.hideMonstersBelow === 0) {
            btn.style.backgroundColor = "red";
            caches.hideMonstersBelow = 10;
        }
        else if (caches.hideMonstersBelow === 75) {
            btn.style.backgroundColor = "green";
            caches.hideMonstersBelow = 0;
        }
        updateDisplay(monsterData, caches);
        btn.innerText = "Hide monsters below " + caches.hideMonstersBelow + "% health";
        localStorage['f2p-addon:minPercentHealth'] = JSON.stringify(caches.hideMonstersBelow);
    })
    let hideButton = document.getElementsByClassName('bl-row-top')[0];
    hideButton.appendChild(buttonBox);

    updateDisplay(monsterData, caches);
}

function updateDisplay(monsterData, caches) {
    let monsterContainer = document.getElementsByClassName('monster-container')[0];
    let nextChild = monsterContainer.firstChild;
    for (let i = monsterData.length-1; i>=0 ; i--) {
        if (monsterData[i].health < caches.hideMonstersBelow/100 && monsterData[i].health !== 0) {
            monsterData[i].element.remove();
        }
        else if (monsterData[i].hidden === false && monsterData[i].health !== 0) {
            monsterContainer.insertBefore(monsterData[i].element, nextChild);
            nextChild = monsterData[i].element;      
        }
        else if (monsterData[i].health === 0) {
            if ((monsterData[i].type === "boss" && caches.bossHidden === true) || monsterData[i].hidden) {
                monsterData[i].element.remove();
            }
            else {
                monsterContainer.insertBefore(monsterData[i].element, nextChild);
                nextChild = monsterData[i].element;
            }
            
        }
    }
}

function hideBossMonstersButton(monsterData, caches) {
    let btn = document.createElement('button');
    btn.classList.add("btn");
    if (caches.bossHidden === true) {
        btn.style.backgroundColor = "green";
        btn.innerText = "Hide Bosses: true";
    }
    else if (caches.bossHidden === false) {
        btn.style.backgroundColor = "red";
        btn.innerText = "Hide Bosses: false";
    }
    else {
        return;
    }

    let buttonBox = document.createElement('div');
    buttonBox.appendChild(btn);
    btn.addEventListener('click', () => {
        if (caches.bossHidden === true) {
            btn.style.backgroundColor = "red";
            btn.innerText = "Hide Bosses: false";
            caches.bossHidden = false;
        }
        else {
            btn.style.backgroundColor = "green";
            btn.innerText = "Hide Bosses: true";
            caches.bossHidden = true;
        }
        updateDisplay(monsterData, caches);
        localStorage['f2p-addon:hideBosses'] = JSON.stringify(caches.bossHidden);
    })
    let hideBossButton = document.getElementsByClassName('bl-row-top')[0];
    hideBossButton.appendChild(buttonBox);

    updateDisplay(monsterData, caches);
}

function monsterDisplayButtons(wave, monsterData, caches) {
    let waveMonsterList = getWaveMonsterList(wave);
    if (!waveMonsterList) { // wave wasn't recognized -- do nothing
        return;
    }
    
    let buttonsElements = document.createElement('div');
    for (let i = 0; i < waveMonsterList.length; i++) {
        let btn = document.createElement('button');
        btn.classList.add("btn");
        btn.style.backgroundColor = "#517891";
        if (i < waveMonsterList.length-1) {
            btn.style.marginRight = '3px';
        }
        
        let j = 0;
        while (j < waveMonsterList.length && j < caches.monstersToHide.length) {
            if (caches.monstersToHide[j] === waveMonsterList[i]) {
                btn.innerText = waveMonsterList[i] + " 🔴";
                removeMarkMonster(monsterData, waveMonsterList[i]);
            }
            j++;
        }
        if (btn.innerText === '') {
            btn.innerText = waveMonsterList[i] + " 🟢";
        }
        btn.addEventListener('click', () => {
            let monster = btn.innerText.slice(0, -3);
            if (btn.innerText.slice(-2) === "🟢") {
                btn.innerText = monster + " 🔴";
                caches.monstersToHide.push(monster);
                removeMarkMonster(monsterData, monster);
            }
            else {
                btn.innerText = monster + " 🟢";
                putBackDeletedMonsters(monsterData, monster, caches);
            }
            updateDisplay(monsterData, caches)
            localStorage['f2p-addon:monstersBlacklist'] = JSON.stringify(caches.monstersToHide);
            
        });
        buttonsElements.appendChild(btn);
    }
    
    let page = document.getElementsByClassName('wave-title')[0];
    page.appendChild(buttonsElements);

    updateDisplay(monsterData, caches);
}

function putBackDeletedMonsters(monsterData, monster, caches) {
    let monsterContainer = document.getElementsByClassName('monster-container')[0];
    for (let i = 0; i < monsterData.length; i++) {
        if (monsterData[i].name === monster) {
            monsterContainer.appendChild(monsterData[i].element);
            monsterData[i].hidden = false;
        }
    }
    console.log(caches.monstersToHide)
    let i = 0
    while (i < caches.monstersToHide.length) {
        if (caches.monstersToHide[i] === monster) {
            caches.monstersToHide.splice(i, 1)
        }
        i++;
    }
    console.log(caches.monstersToHide)
}


function getWaveMonsterList(param) {
    if (param[0] === 'gate=3' && param[1] === 'wave=3') { //wave 1
        return ["Goblin Skirmisher", "Goblin Slinger", "Orc Grunt", "Orc Bonecrusher", "Hobgoblin Spearman"];
    }
    else if (param[0] === 'gate=3' && param[1] === 'wave=5') { //wave 2
        return ["Troll Ravager", "Lizardman Flamecaster", "Troll Brawler", "Lizardman Shadowclaw"];
    }
    else if (param[0] === 'gate=3' && param[1] === 'wave=8') { //wave 3
        return ["Lizardman Vanguard", "Lizardman Warmage", "Lizardman Dreadblade", "Lizardman Juggernaut", "Lizardman Bloodpriest", "Lizardman Guardian"];
    }
    else if (param[0] === 'gate=5' && param[1] === 'wave=9') { //gate 2 
        return ["Charybdis, Living Maelstrom", "Dark Siren", "Deep Sea Beast", "Kraken", "Merfolk", "Scylla, Devourer of Sailors", "The Crab King", "Triton Warrior", "Water Nymph"];
    }
    else if (param[0] === 'event=7' && param[1] === 'wave=4') { //event
        return ["Ashback Bear", "Ashfang Wolf", "Bonecrest Hyena", "Cinderhide Boar", "Cinderstag", "Furnace Lynx", "Pyre Crow", "Soot Viper",
             "Embermaw Drake", "Demonic Drake" ,"Dawncrest Drake", "Stormfang Drake", "Thornbloom Drake", "Tidecoil Drake"];
    }
    else {  //unrecognized wave : return something to quit
        return undefined;
    }
}

function removeMarkMonster(monsterData, monster) {
    for (let i = 0; i < monsterData.length; i++) {
        if (monsterData[i].name === monster) {
            monsterData[i].hidden = true;
            monsterData[i].element.remove();
        }
    }
}

addon_Main();