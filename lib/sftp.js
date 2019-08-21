(function () {
    let Client = require('ssh2-sftp-client');
    function put(CFG, localPath, romotePath, cb) {
        let sftp = new Client();
        Editor.log('开始：链接服务器')
        sftp.connect({
            host: CFG.HOST, // '你的服务器地址'
            port: CFG.PORT, // '端口，没改过的话是22'
            username: CFG.USER, // '连接的用户名'
            password: CFG.PASS, // '密码'
        }).then((data) => {
            Editor.log('完成：链接服务器')
            return sftp.put(localPath, romotePath);
        }).then((data) => {
            Editor.log("上传完成");
            cb && cb();
            sftp.end();
        }).catch((err) => {
            Editor.log('put操作异常');
            Editor.error(err);
            cb && cb('put操作异常');
            sftp.end();
        });
    }
    module.exports = put;
})();