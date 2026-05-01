/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';
import { LAppLive2DManager } from './lapplive2dmanager';

/**
 * ブラウザロード後の処理
 */
// window.addEventListener(
//   'load',
//   (): void => {
//     // 参数初始化
//     const defineConfig = new LAppDefine.DefineConfig('../../Resources/', [
//       'Wanko'
//     ]);
//     LAppDefine.initDefine(defineConfig);
//     // Initialize WebGL and create the application instance
//     if (
//       !LAppGlManager.getInstance() ||
//       !LAppDelegate.getInstance().initialize()
//     ) {
//       return;
//     }
//
//     LAppDelegate.getInstance().run();
//   },
//   { passive: true }
// );
//
// /**
//  * Process when changing screen size.
//  */
// window.addEventListener(
//   'resize',
//   () => {
//     if (LAppDefine.CanvasSize === 'auto') {
//       LAppDelegate.getInstance().onResize();
//     }
//   },
//   { passive: true }
// );
declare global {
  interface Window {
    live2d: any;
  }
}

window.live2d = window.live2d || {};

/**
 * live2d初始化
 */
window.live2d.init = (cdnPath: string) => {
  // 参数初始化
  if (
    !LAppGlManager.getInstance() ||
    !LAppDelegate.getInstance().initialize()
  ) {
    return;
  }
  LAppDelegate.getInstance().run();
};

/**
 * 加载模型
 * @param modelDir 模型目录
 */
window.live2d.loadModel = (modelDir: string) => {
  LAppLive2DManager.getInstance().loadModel(modelDir);
};

/**
 * 随机表情
 */
window.live2d.randomExpression = () => {
  LAppLive2DManager.getInstance().randomExpression();
};

/**
 * 获取canvas的Blob数据
 */
window.live2d.getCanvasBlob = () => {
  return LAppDelegate.getInstance().getCanvasBlob();
}

/**
 * 释放模型
 */
window.addEventListener(
  'beforeunload',
  (): void => LAppDelegate.releaseInstance(),
  { passive: true }
);
