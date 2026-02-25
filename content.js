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
    let lowHealthToHide = localStorage['F2PAddonLowHealthHide'];
    if (lowHealthToHide) {
        lowHealthToHide = JSON.parse(lowHealthToHide);
    }
    else {
        localStorage['F2PAddonLowHealthHide'] = JSON.stringify(0);
        lowHealthToHide = 0;
    }

    let hideBoss = localStorage['F2PAddonHideBosses'];
    if (hideBoss) {
        hideBoss = JSON.parse(hideBoss);
    }
    else {
        localStorage['F2PAddonHideBosses'] = JSON.stringify(false);
        hideBoss = false;
    }
    return ({hideMonstersBelow: lowHealthToHide, bossHidden: hideBoss})

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
        markLowHealthMonsters(monsterData, caches);
        btn.innerText = "Hide monsters below " + caches.hideMonstersBelow + "% health";
        localStorage['F2PAddonLowHealthHide'] = JSON.stringify(caches.hideMonstersBelow);
    })
    let hideButton = document.getElementsByClassName('bl-row-top')[0];
    hideButton.appendChild(buttonBox);

    markLowHealthMonsters(monsterData, caches);
}

function markLowHealthMonsters(monsterData, caches) {
    let monsterContainer = document.getElementsByClassName('monster-container')[0];
    let nextChild = monsterContainer.firstChild;
    for (let i = monsterData.length-1; i>=0 ; i--) {
        if (monsterData[i].health < caches.hideMonstersBelow/100 && monsterData[i].health !== 0) {
            if (monsterData[i].type !== "boss" || caches.bossHidden === true) {
                monsterData[i].element.remove();
            }
        }
        else if (monsterData[i].hidden === false && monsterData[i].health !== 0) {
            monsterContainer.insertBefore(monsterData[i].element, nextChild);
            nextChild = monsterData[i].element;      
        }
        else if (monsterData[i].health === 0) {
            if (monsterData[i].type === "boss" && caches.bossHidden === true) {
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
        markLowHealthMonsters(monsterData, caches);
        localStorage['F2PAddonHideBosses'] = JSON.stringify(caches.bossHidden);
    })
    let hideBossButton = document.getElementsByClassName('bl-row-top')[0];
    hideBossButton.appendChild(buttonBox);

    markLowHealthMonsters(monsterData, caches);
}
addon_Main();