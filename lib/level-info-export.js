var xlsx = require('xlsx');
var fs = require('fs');
var path = require('path');

/** 获取每个单元格的值 */
function getCellValue(sheet, col, row) {
    return sheet[col + row] ? sheet[col + row].v : '';
}
/** 获取prefab */
function getPrefab(sheet, len) {
    var obj = {};
    for (let i = 2; i <= len; i++) {
        // console.log('i = ' + i);
        var pid = getCellValue(sheet, 'A', i);
        var name = getCellValue(sheet, 'B', i).replace(/[\n|\r]+/g, ' ');
        var themeId = getCellValue(sheet, 'C', i);
        var audio = getCellValue(sheet, 'E', i);
        var imgCount = getCellValue(sheet, 'F', i);

        if ((/新闻联播/g).test(audio)) {
            audio = 'xinwenlianbo';
        } else if ((/女神风/g).test(audio)) {
            audio = 'nvshenfeng';
        } else if ((/眼保健操/g).test(audio)) {
            audio = 'yanbaojianchao';
        } else if ((/佩奇是啥/g).test(audio)) {
            audio = 'peiqishisha';
        } else {
            audio = '';
        }

        var data = {};
        if (name) data.name = name;
        if (themeId) data.themeId = themeId;
        if (audio) data.audio = audio;
        if (imgCount) data.imgCount = imgCount;
        obj[pid] = data;
    }
    return obj;
}
/** 获取sort */
function getSort(sheet, len) {
    var obj = {};
    let count = 0;
    for (let i = 2; i <= len; i++) {

        var id = getCellValue(sheet, 'A', i);
        var pid = getCellValue(sheet, 'D', i);
        var next = getCellValue(sheet, 'B', i);
        if (parseInt(id) < 1000) count++;
        var data = {};
        if (id) data.id = id;
        if (pid) data.pid = pid;
        if (next) data.next = next;
        obj[id] = data;
    }
    var key = count + 1;
    obj[key] = { "isEnd": true };
    return obj;
}

/**
 * 获取图鉴
 * @param {Sheet} sheet sortSheet
 * @param {number} len sortCount
 */
function getIllustration(sheet, len) {
    var obj = {};
    for (let i = 2; i <= len; i++) {
        var pid = getCellValue(sheet, 'D', i);
        var themeId = getCellValue(sheet, 'F', i);
        var themeName = getCellValue(sheet, 'G', i);
        if (!obj.hasOwnProperty(themeId)) {
            obj[themeId] = { arr: [] }
        }
        obj[themeId].arr.push({ pid: pid });
        obj[themeId].name = themeName;
        obj[themeId].id = themeId;
    }
    // 获取数组并且按从小到大排序
    var arr = Object.values(obj);
    arr.sort(function(a, b) {
        return parseInt(a.id) - parseInt(b.id);
    })
    return arr;
}

/**
 * 导出游戏配置
 * @param {String} lan 语言: cn en
 * @param {String} pf 平台类型有 wx tt fb
 * @param {number} prefabCount 预制数量
 * @param {number} sortCount 关卡数量
 * @param {String} filePath excel文件路径
 * @param {String} outDir 输出目录
 */
function levelInfoExport(lan, pf, prefabCount, sortCount, filePath, outDir) {
    var workBook = xlsx.readFile(filePath);
    var prefabSheet = lan == 'en' ? workBook.Sheets['FB原始关卡配置'] : workBook.Sheets['原始关卡配置'];
    var sortSheet = null;
    if (lan == 'en') {
        sortSheet = workBook.Sheets['FB关卡配置表'];
    } else if (pf == 'tt') {
        sortSheet = workBook.Sheets['头条配置表'];
    } else if (pf == 'wx') {
        sortSheet = workBook.Sheets['微信手Q关卡配置表'];
    }

    prefabCount = prefabCount || 92;
    sortCount = sortCount || 85;
    var PREFAB = getPrefab(prefabSheet, prefabCount);
    fs.writeFileSync(path.join(outDir, 'PREFAB.json'), JSON.stringify(PREFAB), { encoding: 'utf8' });
    var SORT = getSort(sortSheet, sortCount);
    fs.writeFileSync(path.join(outDir, 'SORT.json'), JSON.stringify(SORT), { encoding: 'utf8' });
    var ILLUSTRATION = getIllustration(sortSheet, sortCount);
    fs.writeFileSync(path.join(outDir, 'ILLUSTRATION.json'), JSON.stringify(ILLUSTRATION), { encoding: 'utf8' });
}
module.exports = levelInfoExport;