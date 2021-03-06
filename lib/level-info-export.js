var xlsx = require('xlsx');
var fs = require('fs');
var path = require('path');

/** 获取表格的数量 */
function getSheetLen(sheet) {
    var total = 2000;
    for (let i = 2; i < total; i++) {
        var value = getCellValue(sheet, 'A', i);
        if (!value) return i - 1;
    }
}
/** 获取每个单元格的值 */
function getCellValue(sheet, col, row) {
    return sheet[col + row] ? sheet[col + row].v : '';
}
/** 获取prefab */
function getPrefab(sheet, len, isSH) {
    var obj = {};
    len = len || getSheetLen(sheet);
    Editor.info('prefab len = ' + len);
    for (let i = 2; i <= len; i++) {
        // console.log('i = ' + i);
        var pid = getCellValue(sheet, 'A', i);
        var name = getCellValue(sheet, 'B', i).replace(/[\n|\r]+/g, ' ');
        // var themeId = getCellValue(sheet, 'C', i);
        var audio = getCellValue(sheet, 'E', i);
        var imgCount = getCellValue(sheet, 'F', i);

        // /** 审核版本 */
        // var isHide = getCellValue(sheet, 'G', i);
        // if (isSH && isHide == '1') {
        //     continue;
        // }

        if ((/新闻联播/g).test(audio)) {
            audio = 'xinwenlianbo';
        } else if ((/卡门节选|女神风/g).test(audio)) {
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
        // if (themeId) data.themeId = themeId;
        if (audio) data.audio = audio;
        if (imgCount) data.imgCount = imgCount;
        obj[pid] = data;
    }
    return obj;
}
/** 获取sort */
function getSort(sheet, len, isSH) {
    var obj = {};
    let count = 0;
    len = len || getSheetLen(sheet);
    Editor.info('sort len = ' + len);
    for (let i = 2; i <= len; i++) {

        // var id = getCellValue(sheet, 'A', i);
        var id = count + 1;
        var pid = getCellValue(sheet, 'D', i);
        // var next = getCellValue(sheet, 'B', i);        

        /** 审核版本 */
        var isHide = getCellValue(sheet, 'J', i);
        if (isSH && isHide == '1') {
            continue;
        }

        /** 记录数量 */
        if (parseInt(id) < 1000) count++;

        var data = {};
        if (id) data.id = id;
        if (pid) data.pid = pid;
        // if (next) data.next = next;
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
    var list = {};
    var obj = {};
    len = len || getSheetLen(sheet);
    Editor.info('illustration len = ' + len);
    for (let i = 2; i <= len; i++) {
        var pid = getCellValue(sheet, 'D', i);
        var themeId = getCellValue(sheet, 'F', i);
        var themeName = getCellValue(sheet, 'G', i);
        if (!obj.hasOwnProperty(themeId)) {
            obj[themeId] = { arr: [] }
        }
        if (list[pid]) {
            Editor.warn(`pid=[${pid}] is exit in themeId=[${list[pid]}], again want to push into themeId=[${themeId}]`);
        } else {
            obj[themeId].arr.push({ pid: pid });
            obj[themeId].name = themeName;
            obj[themeId].id = themeId;
            list[pid] = themeId;
        }
    }
    // 获取数组并且按从小到大排序
    var arr = Object.values(obj);
    arr.sort(function (a, b) {
        return parseInt(a.id) - parseInt(b.id);
    })
    return arr;
}

function getChapter(sheet, len, isSH) {
    var list = {};
    var obj = {};
    len = len || getSheetLen(sheet);
    Editor.info('Chapter len = ' + len);
    var COVER_TYPE = {
        '左': 0,
        '中': 1,
        '右': 2
    }
    var starList = {};
    for (let i = 2; i <= len; i++) {
        var sortId = getCellValue(sheet, 'A', i);
        var pid = getCellValue(sheet, 'D', i);
        var chapterId = getCellValue(sheet, 'K', i);
        var chapterName = getCellValue(sheet, 'L', i);
        // var themeId = getCellValue(sheet, 'F', i);
        // var themeName = getCellValue(sheet, 'G', i);
        var averageUnlockStars = getCellValue(sheet, 'M', i);
        var coverValue = getCellValue(sheet, 'N', i);
        chapterName = (chapterName + '').replace(/\d+/g, '');

        /** 审核版本 */
        var isHide = getCellValue(sheet, 'J', i);
        if (isSH && isHide == '1') {
            continue;
        }

        if (!obj.hasOwnProperty(chapterId)) {
            obj[chapterId] = { id: chapterId, arr: [], cover: [] }
            starList[chapterId] = 0;
        }

        if (coverValue) { // 记录封面图片的pid
            var coverIdx = COVER_TYPE[coverValue];
            obj[chapterId].cover[coverIdx] = pid;
        }

        if (list[pid]) {
            Editor.warn(`pid=[${pid}] is exit in themeId=[${list[pid]}], again want to push into chapterId=[${chapterId}]`);
        } else {
            starList[chapterId] += averageUnlockStars;
            obj[chapterId].arr.push({ pid: pid, sortId: sortId });
            obj[chapterId].name = chapterName;
            obj[chapterId].id = chapterId;
            list[pid] = chapterId;
        }
    }


    // 获取数组并且按从小到大排序
    var arr = Object.values(obj);
    arr.sort(function (a, b) {
        return parseInt(a.id) - parseInt(b.id);
    });

    // 总星星 并且排序
    // Editor.info(JSON.stringify(arr));
    var len = arr.length;
    var totalStars = 0;
    for (var j = 0; j < len; j++) {
        var chapter = arr[j];
        var id = chapter.id;
        totalStars = starList[id] + totalStars;
        chapter.unlockStars = parseInt(totalStars - starList[id]);
        chapter.arr.sort(function(a, b) {
            return parseInt(a.sortId) - parseInt(b.sortId);
        });
    }
    return arr;
}

/**
 * 导出游戏配置
 * @param {String} pf 平台类型有 wx tt fb
 * @param {String} filePath excel文件路径
 * @param {String} outDir 输出目录
 * @param {number} prefabCount 预制数量
 * @param {number} sortCount 关卡数量
 */
function levelInfoExport(pf, filePath, outDir, prefabCount, sortCount, isSH) {
    Editor.info('filePath = ' + filePath);
    /** 确保目录存在 */
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }
    var workBook = xlsx.readFile(filePath);
    var sortSheet = null, prefabSheet = null;
    switch (pf) {
        case 'fb':
            prefabSheet = workBook.Sheets['FB原始关卡配置'];
            sortSheet = workBook.Sheets['FB关卡配置表'];
            break;
        case 'tt':
            prefabSheet = workBook.Sheets['原始关卡配置'];
            sortSheet = workBook.Sheets['头条配置表'];
            break;
        case 'wx':
            prefabSheet = workBook.Sheets['原始关卡配置'];
            sortSheet = workBook.Sheets['微信手Q关卡配置表'];
            break;
        default:
            break;
    }

    var PREFAB = getPrefab(prefabSheet, prefabCount, isSH);
    fs.writeFileSync(path.join(outDir, 'PREFAB.json'), JSON.stringify(PREFAB), { encoding: 'utf8' });
    var SORT = getSort(sortSheet, sortCount, isSH);
    fs.writeFileSync(path.join(outDir, 'SORT.json'), JSON.stringify(SORT), { encoding: 'utf8' });
    // var ILLUSTRATION = getIllustration(sortSheet, sortCount);
    // fs.writeFileSync(path.join(outDir, 'ILLUSTRATION.json'), JSON.stringify(ILLUSTRATION), { encoding: 'utf8' });
    var CHAPTER = getChapter(sortSheet, sortCount, isSH);
    fs.writeFileSync(path.join(outDir, 'CHAPTER.json'), JSON.stringify(CHAPTER), { encoding: 'utf8' });
    Editor.info(JSON.stringify(outDir));
}
module.exports = levelInfoExport;