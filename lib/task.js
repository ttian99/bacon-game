(function () {
    var path = require('path');
    var fs = require('fs-extra');
    var glob = require('glob');
    var spawn = require(Editor.url('./spawn.js'));

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
            var src = path.join(Editor.Project.path, 'build/wechatgame');
            var dest = path.join(Editor.Project.path, 'build/ttgame');
            fs.removeSync(dest);
            // fs.emptyDirSync(dest);
            fs.copySync(src, dest);
            var jsonPath = path.join(dest, 'project.config.json');
            var json = fs.readJSONSync(jsonPath, { encoding: 'utf8' });
            json.appid = 'tt16f0604d89daa450';
            fs.writeJSONSync(jsonPath, json, { encoding: 'utf8' });
            Editor.success('完成拷贝wechatgame到ttgame');
        } catch (error) {
            Editor.error('错误拷贝wechatgame到ttgame: ' + error.name + ' - ' + error.message);
        }
    }
    var task = new Task();
    module.exports = task;
})();