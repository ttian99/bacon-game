let task = require(Editor.url('packages://bacon-game/lib/task.js'));

// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h1>Bacon游戏插件</h1>
    <hr />
    <h2>关卡读取</h2>
    <hr />
    <h2>facebook小游戏</h2>
    <section>
      <ui-label class="blue">构建facebook平台请优先导入图片资源</ui-label>
      <ui-prop name="导入level图片资源" tooltip="由于facebook平台不允许加载非白名单域名内的图片资源，所以需要导入doc/level文件夹到resources/texture/level下用来动态加载">
        <ui-button id="fb_import_btn">Import</ui-button>
      </ui-prop>
      <ui-prop name="拷贝debug工具" tooltip="用于本地测试">
        <ui-button id="fb_copy_debug_btn">拷贝facebook本地调试工具到构建后的目录</ui-button>
      </ui-prop>
    </section>
    <hr />
    <h2>头条小游戏(ttgame)</h2>
      <section>
        <ui-prop name="自动拷贝" tooltip="自动拷贝构建完成的wechatgame到ttgame">
        <ui-checkbox id="tt_auto_copy"></ui-checkbox>
        </ui-prop>
        <ui-prop name="AppID" tooltip="头条小程序的AppID，真机调试需要填写正确">
        <ui-input id="tt_appid" placeholder="输入头条小程序appid"></ui-input>
        </ui-prop>
      </section>
      <div style="margin-top: 20px; margin-bottom: 20px; text-align: center">
        <ui-button id="tt_save_btn" class="green">保存</ui-button>
      </div>
    <hr />
    <h2>微信小游戏(wechat)</h2>
  `,

  // element and variable binding
  $: {
    fb_import_btn: '#fb_import_btn',
    fb_copy_debug_btn: '#fb_copy_debug_btn',
    tt_auto_copy: '#tt_auto_copy',
    tt_appid: '#tt_appid',
    tt_save_btn: '#tt_save_btn',
  },

  run(data) {

  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$fb_import_btn.addEventListener('confirm', () => {
      Editor.info('在facebook平台，导入level文件的图片到resources/texture/下面');
      task.fbImportLevel();
    });
    this.$fb_copy_debug_btn.addEventListener('confirm', () => {
      task.fbCopyDebug();
    });
    this.$tt_save_btn.addEventListener('confirm', () => {
      Editor.info(`appid = ${this.$tt_appid.$input.value} autoCopy = ${this.$tt_auto_copy.checked}`);
    });
  },

  // register your ipc messages here
  messages: {
    'facebook-instant-game-debug:hello'(event) {
      this.$label.innerText = 'Hello!';
    }
  }

});