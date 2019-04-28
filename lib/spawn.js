(function () {
    var nodeSpawn = require('child_process').spawn;
    function Spawn(cwd, params, cb) {
        Editor.info('cwd = ' + cwd);

        var opts = {
            // stdio: 'inherit',
            encoding: 'utf8',
            timeout: 0,
            maxBuffer: 900 * 1024,
            killSignal: 'SIGTERM',
            cwd: cwd,
            env: null
        }

        Editor.info('npm install');
        var cmd = process.platform == 'win32' ? 'npm.cmd' : 'npm';
        var ls = nodeSpawn(cmd, params, opts);
        ls.stdout.on('data', function (data) {
            Editor.log(data + '');
        });
        ls.stderr.on('data', function (data) {
            Editor.error('npm install error: ' + data + '');
        });
        ls.on('close', function (code) {
            if (code !== 0) {
                Editor.warn('child exists with code: ' + code);
                cb && cb();
                return;
            }
            Editor.info('npm install over!');
            cb && cb();
        });
    }
    module.exports = Spawn
})();