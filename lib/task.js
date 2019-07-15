(function () {
    var path = require('path');
    var fs = require('fs-extra');
    var glob = require('glob');
    var spawn = require(Editor.url('./spawn.js'));
    var levelInfoExport = require(Editor.url('./level-info-export.js'));
    var genMD5File = require(Editor.url('./makeMD5.js'));
    // var zip = require('cross-zip');
    var zip = require('node-zip-dir');
    var moment = require('moment');

    function Task() { }

    Task.prototype.fbCopyDebug = function () {
        Editor.log('开始 拷贝debug文件');
        try {
            var src = Editor.url('packages://bacon-game/debug');
            var dest = path.join(Editor.Project.path, 'build/fb-instant-games');
            fs.copySync(src, dest);
            Editor.success('完成 拷贝debug文件');
        } catch (error) {
            Editor.error('错误 拷贝debug文件: ' + error.name + ' - ' + error.message);
        }
    }

    Task.prototype.fbImportLevel = function () {
        try {
            Editor.info('开始 导入level图片 ');
            var levelPath = path.join(Editor.Project.path, 'doc/level')
            var files = glob.sync(levelPath);
            Editor.assetdb.import(files, 'db://assets/resources/texture', 'no params', function (err, results) {
                Editor.success('完成 导入level图片, 数量：' + results.length);
            });
        } catch (error) {
            Editor.error('错误 导入level图片: ' + error.name + ' - ' + error.message);
        }
    }

    Task.prototype.install = function () {
        Editor.info('开始: 安装第三方依赖包');
        try {
            var cwd = Editor.Package.packagePath('bacon-game');
            var params = ['install'];
            spawn(cwd, params, function () {
                Editor.success('完成: 安装第三方依赖包');
            });
        } catch (error) {
            Editor.error('错误: 安装第三方依赖包: ' + error.name + ' - ' + error.message);
        }
    }

    Task.prototype.ttCopyBuild = function () {
        Editor.log('开始拷贝wechatgame到ttgame');
        try {
            var cfg = this.loadConfig();
            var src = path.join(Editor.Project.path, 'build/wechatgame');
            var dest = path.join(Editor.Project.path, 'build/ttgame');
            fs.removeSync(dest);
            // fs.emptyDirSync(dest);
            fs.copySync(src, dest);
            // 改写appid
            var jsonPath = path.join(dest, 'project.config.json');
            var json = fs.readJSONSync(jsonPath, { encoding: 'utf8' });
            Editor.info('ttgame appid = ' + cfg.appid);
            json.appid = cfg.appid;
            fs.writeJSONSync(jsonPath, json, { encoding: 'utf8' });

            // 写入头条小游戏跳转列表
            var gameJsonPath = path.join(dest, 'game.json');
            var gameJson = fs.readJSONSync(gameJsonPath, { encoding: 'utf8' });
            Editor.info('ttgame ttNavigateToMiniGameAppIdList = ' + JSON.stringify(cfg.ttNavigateToMiniGameAppIdList));
            gameJson.ttNavigateToMiniGameAppIdList = cfg.ttNavigateToMiniGameAppIdList;
            fs.writeJSONSync(gameJsonPath, gameJson, { encoding: 'utf8' });
            
            // 拷贝更多游戏按钮
            var imagesPath = path.join(dest, 'images');
            var curImages = Editor.url('packages://bacon-game/images');
            fs.copySync(curImages, imagesPath);
            Editor.success('完成拷贝wechatgame到ttgame');
        } catch (error) {
            Editor.error('错误拷贝wechatgame到ttgame: ' + error.name + ' - ' + error.message);
        }
    }

    /** 更新关卡信息 */
    Task.prototype.updateLevelSort = function (pf, filePath, outDir, prefabCount, sortCount, isSH) {
        Editor.log('开始 更新关卡信息');
        Editor.log(filePath);
        Editor.log(outDir);
        try {
            levelInfoExport(pf, filePath, outDir, prefabCount, sortCount, isSH)
            Editor.success('完成 更新关卡信息');
        } catch (error) {
            Editor.error('错误 更新关卡信息: ' + error.name + ' - ' + error.message);
        }
    }

    Task.prototype.makeMD5Map = function(filename) {
        Editor.log('开始生成md5文件');
        genMD5File(filename);
    }
    Task.prototype.saveConfig = function (data) {
        fs.writeJsonSync(Editor.url('packages://bacon-game/config/config.json'), data, { encoding: 'utf8' })
    }

    Task.prototype.loadConfig = function () {
        let cfg = fs.readJsonSync(Editor.url('packages://bacon-game/config/config.json'));
        return cfg;
    }

    Task.prototype.zipRes = function(pf) {
        try {
            fs.ensureDirSync(path.join(Editor.Project.path, 'build/ttgame_res/'))
            var resPath = path.join(Editor.Project.path, 'build/ttgame/res');
            const filename = 'res.' + moment().format('YYYYMMDD_hhmmss') + '.zip';
            var outPath = path.join(Editor.Project.path, 'build/ttgame_res/', filename);
            Editor.log(outPath);
            Editor.log('开始压缩res目录');
            // 压缩
            zip.zip(resPath, outPath).then(() => {
                Editor.log('完成压缩res目录');
                Editor.log('开始删除res目录');
                fs.removeSync(resPath)
                Editor.log('完成删除res目录'); 
            }).catch(function(err) {
                console.error(err);

            });      
        } catch (error) {
            Editor.error('异常zipRes');      
            Editor.error(error);
        }
      
    }
    var task = new Task();
    module.exports = task;
})();