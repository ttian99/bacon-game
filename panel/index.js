let task = require(Editor.url('packages://bacon-game/lib/task.js'));
var path = require('path');

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
    <section>
      <ui-prop name="配置表excel路径" tooltip="选择关卡配置文件">
        <ui-input readonly id="excel_file_input" style="width: 300px"></ui-input>
        <ui-button id="excel_file_btn" class="green">选择文件</ui-button>
      </ui-prop>
      <ui-prop name="导出json目录" tooltip="选择PREFAB.json SORT.json的输出目录">
        <ui-input id="json_file_input" style="width: 300px"></ui-input>
        <ui-button id="json_file_btn" class="green">选择目录</ui-button>      
      </ui-prop>
      <ui-prop name="选择平台">
        <ui-select id="platform" value="wx">
          <option value="wx">微信</option>
          <option value="tt">头条</option>
          <option value="fb">facebook</option>
        </ui-select>
      </ui-prop>
      <ui-prop name="选择语言">
        <ui-select id="language" value="cn">
          <option value="cn">中文</option>
          <option value="en">英文</option>
        </ui-select>
      </ui-prop>
      <ui-prop name="原始关卡配置的数量" tooltips="" class="red">
        <ui-num-input id="prefab_count" step="1" placeholder="92" value="92" disabled></ui-num-input>
        <ui-checkbox id="prefab_count_checkbox" checked="true">自动读取数量</ui-checkbox>
      </ui-prop>
      <ui-prop name="实际关卡配置的数量" tooltips="" class="red">
        <ui-num-input id="sort_count" step="1" placeholder="85" value="85" disabled></ui-num-input>
        <ui-checkbox id="sort_count_checkbox" checked="true">自动读取数量</ui-checkbox>
      </ui-prop>
      <div style="margin-top: 20px; margin-bottom: 20px; text-align: center">
        <ui-label class="red">导出配置前请一定填写正确的数量</ui-label>
        <br/>
        <ui-button id="export_level_btn" class="yellow">导出</ui-button>
      </div>
    </section>
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
    excel_file_btn: '#excel_file_btn',
    excel_file_input: '#excel_file_input',
    json_file_btn: '#json_file_btn',
    json_file_input: '#json_file_input',
    export_level_btn: '#export_level_btn',
    language: '#language',
    platform: '#platform',
    prefab_count: '#prefab_count',
    sort_count: '#sort_count',
    prefab_count_checkbox: '#prefab_count_checkbox',
    sort_count_checkbox: '#sort_count_checkbox',
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
      Editor.info(`this.$import_file = ${this.$import_file.value}`);
    });

    const DEFAULT_EXCEL_PATH = path.join(Editor.Project.path, 'doc/配置表/小猪煎强关卡配置表编排顺序.xlsx');
    const DEFAULT_JSON_PATH = path.join(Editor.Project.path, 'doc/配置表/cn');
    this.$excel_file_input.value = DEFAULT_EXCEL_PATH;
    this.$json_file_input.value = DEFAULT_JSON_PATH;
    this.$excel_file_btn.addEventListener('confirm', () => {
      let res = Editor.Dialog.openFile({
        title: "选择Excel文件",
        defaultPath: DEFAULT_EXCEL_PATH,
        properties: ['openFile'],
      });
      if (res !== -1) {
        Editor.info(res);
        this.$excel_file_input.value = res;
      }
    });
    this.$json_file_btn.addEventListener('confirm', () => {
      let res = Editor.Dialog.openFile({
        title: "选择导出Json的目录",
        defaultPath: DEFAULT_JSON_PATH,
        properties: ['openDirectory'],
      });
      if (res !== -1) {
        Editor.info(res);
        var dir = res[0];
        this.$json_file_input.value = dir;
      }
    });
    this.$export_level_btn.addEventListener('confirm', () => {
      const lan = this.$language.value;
      const pf = this.$platform.value;
      const prefabCount = !this.$prefab_count_checkbox.checked ? this.$prefab_count.value : undefined;
      const sortCount = !this.$sort_count_checkbox.checked ? this.$sort_count.value : undefined;
      Editor.info(`export => lan = ${lan}, pf = ${pf}, prefabCount = ${prefabCount}, sortCount = ${sortCount}`);
      task.updateLevelSort(lan, pf, this.$excel_file_input.value, this.$json_file_input.value, prefabCount, sortCount);
    });
    this.$sort_count_checkbox.addEventListener('change', (event) => {
      this.$sort_count.disabled = !!this.$sort_count_checkbox.checked;
    });
    this.$prefab_count_checkbox.addEventListener('change', (event) => {
      this.$prefab_count.disabled = !!this.$prefab_count_checkbox.checked;
    });
  },

  // register your ipc messages here
  messages: {
    'facebook-instant-game-debug:hello'(event) {
      this.$label.innerText = 'Hello!';
    }
  }

});