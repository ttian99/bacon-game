
(function () {
    var crypto = require('crypto');
    var fs = require("fs");
    var path = require('path');

    function genMD5File(filename) {

        var rootPath = path.join(Editor.Project.path, 'build/' + filename);
        var exists = fs.existsSync(rootPath);
        if (!exists){
            Editor.error("加密目标路径不存在:"+rootPath);
            return;
        }
        Editor.log("目标路径："+rootPath);

        var outPath = path.join(Editor.Project.path, "build-templates/" + filename);
        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath);
        }
        var outFile = path.join(Editor.Project.path, "build-templates/" + filename + "/md5.json");
        Editor.log("生成中...");
        var md5Content = [];
        readFold(rootPath, function (content, filePath) {
            var md5Str = cryptContent(content);
            var filePathInApp = filePath.substr(rootPath.length+1);
            var filePathInApp = filePathInApp.split('\\').join('/');
            md5Content.push({path:filePathInApp, md5:md5Str});
        });
        var fileContent = JSON.stringify(md5Content);
        fs.writeFileSync(outFile, fileContent, { encoding: 'utf8' });
        Editor.log("输出路径："+outFile);
    }

    function cryptContent(content) {
        var md5 = crypto.createHash('md5');
        return md5.update(content).digest('hex');
    }

    function readFold(foldPath, callback) {
        var files = fs.readdirSync(foldPath);
        for (let i = 0, len = files.length; i < len; i++) {
            const fileName = files[i];
            var filePath = path.join(foldPath + '/', fileName);
            var stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                readFold(filePath, callback);
            }
            if (stats.isFile()) {
                var content = fs.readFileSync(filePath, 'utf-8');
                callback(content, filePath);
            }
        }
    }

    module.exports = genMD5File;
})()



