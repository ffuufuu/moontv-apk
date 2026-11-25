# Nova 影库 · 项目档案

自用影视站「Nova 影库」的完整记录：网站本体、Android 用户端、Android 管理端，以及它们各自的维护方式。

> 本文件是交接文档。以后要改东西，先看这里，再动手。

---

## 一、当前状态（已定稿）

| 项目 | 状态 |
|---|---|
| 网站 | 正式运行中，**已定稿冻结**，只做故障修复不做功能改动 |
| 用户端 APK | `Nova 影库` 版本 **7.4**（versionCode 74） |
| 管理端 APK | `Nova 影库·管理` 版本 **4.10**（versionCode 25） |
| 视频源 | 35 个（原 124 个体检后按品牌去重 + 删除不支持关键词搜索的源） |
| 账号体系 | 站点自带账号，管理端另有独立令牌 |

### 对外分发地址

| 用途 | 地址 |
|---|---|
| 用户端最新包 | `https://nova.550556.xyz/Nova.apk` |
| 管理端最新包 | `https://nova.550556.xyz/Nova-admin.apk` |
| 用户端更新清单 | `https://nova.550556.xyz/update.json` |
| 管理端更新清单 | `https://nova.550556.xyz/admin-update.json` |

App 里的「检查更新」读的是这两个清单，清单里的 `versionCode` 比本地大就会提示升级。

---

## 二、版本一览

### 用户端（包名 `xyz.nova.moontv`，应用名「Nova 影库」）

| 版本 | vc | 主要改动 | 归档文件 |
|---|---|---|---|
| 7.3 | 70 | 从 MoonTVPlus 原包改造：去掉强制卡密门禁、全部换成 Nova 品牌 | `Nova-7.3.apk` |
| 7.3.1 | 71 | 手势阈值 32dp→56dp，缓一点 | — |
| 7.3.2 | 72 | 手势改为**只在左右边缘 64dp 内**响应，修复横屏点「换集」误触音量 | `Nova-7.3.2.apk` |
| 7.3.3 | 73 | 换**正式签名**、停用设备上报、删存储权限 | `Nova-7.3.3.apk` |
| 7.4 | 74 | 启动预热改为拉首包、开屏 500ms→180ms、关闭沙箱校验 | `Nova-7.4.apk` |

### 管理端（包名 `xyz.nova.moontv.admin`，应用名「Nova 影库·管理」）

| 版本 | vc | 主要改动 | 归档文件 |
|---|---|---|---|
| 4.9 | 24 | 从 MoonTVPlus 管理后台改造：卡密 tab 整个移除、改名 | `Nova-Admin-4.9.apk` |
| 4.10 | 25 | 换正式签名、删存储权限 | `Nova-Admin-4.10.apk` |

### 仓库里其他文件（说明用途，别装错）

- `Nova-Shell-7.3.apk`、`Nova-Admin-Shell-7.3.apk`：早期用官方 Gradle 工程重建的「基础壳」，**功能残缺，已废弃，不要使用**
- `MoonTVPlus*.apk`、`up_MoonTVPlus.apk`、`MoonTVOne-5.0t6.apk`、`MoonTVPush.apk`：历史遗留
- `history/`：旧版本归档
- `nova-web-mobile-v1/`：网页手机端紫化改版的存档，**正式站未部署**，仅留档

---

## 三、签名（非常重要）

| 项 | 值 |
|---|---|
| 证书 | 自建正式证书，CN=Nova, O=550556, C=CN，RSA 2048，有效期 25 年 |
| SHA-256 指纹 | `eb5bf3710d872c7fa40f8dc1147f950407d87bad3486df2d6af9fae146579141` |
| 密钥文件 | 不在仓库里，单独保管（私钥泄露等于任何人可以冒充发版） |

规则：

1. **7.3.3 起全部用这张正式证书签名**。之前的包是 Android 调试证书，指纹不同。
2. 换证书后**旧包不能覆盖安装，必须先卸载**。7.3.2 及更早的包与 7.3.3 之后的包彼此都不兼容。
3. 不要再用 Android 调试证书签正式包——国产安全软件会把「调试证书 + 安装权限」判成灰色软件（`a.gray.BulimiaTGen` 之类）。这是误报，但用户那头会看到吓人的提示。
4. App 里原来的「签名不符就拒绝运行」自检已关闭，换证书不会再闪退。

---

## 四、怎么发一个新版本

### 方式 A：手机上发（推荐日常用）

管理端 App 的「推送」页可以直接上传新 APK 并改清单，全在手机完成，不用开电脑：

1. 拿到新 APK
2. 管理端 → 推送 → 选择文件 → 上传
3. 改版本号后提交，清单自动更新
4. 老用户打开 App 点「版本信息 → 立即检查更新」就能升级

管理端第一次打开要输入**管理员令牌**。令牌不是写死在包里的，值在服务器 `/opt/appadmin/token` 文件里，形如 `mtv-...`（**不要外传、不要提交进仓库**）。

### 方式 B：本地构建（改代码时用）

源码是**手工 Java 工程，没有 Gradle**，用 aapt2 / javac / d8 / zipalign / apksigner 直接打包。

环境要求：

- JDK 17
- Android SDK：`platforms/android-34/android.jar` + `build-tools/34.0.0`
- 正式签名密钥（见上一节）

打包脚本 `build.sh` 已经在源码根目录，执行 `bash build.sh` 会同时产出用户端和管理端两个包。要点：

```
aapt2 compile --dir res -o out/res.zip
aapt2 link -o out/unsigned.apk -I android.jar --manifest AndroidManifest.xml \
    --java out/gen --min-sdk-version 21 --target-sdk-version 34 out/res.zip
javac --release 8 -encoding UTF-8 -cp "android.jar:libs/*" -d out/classes <java 源码 + R.java>
jar cf out/classes.jar -C out/classes .
d8 --min-api 21 --lib android.jar --output out/dex out/classes.jar   # 管理端不带 libs
zip 把 classes.dex 塞进 unsigned.apk → zipalign -f 4 → apksigner sign
```

源码结构（`moontv-app/`）：

| 文件 | 作用 |
|---|---|
| `src/xyz/nova/moontv/MainActivity.java` | 用户端主界面、WebView、手势、更新、投屏入口 |
| `src/xyz/nova/moontv/PlayOverlay.java` | 播放浮层：选集面板、下一集、画面填充、卡顿换源 |
| `src/xyz/nova/moontv/Dlna.java` | 投屏 |
| `src/xyz/nova/moontv/ApkProvider.java` | 应用内更新时的安装包分发 |
| `src/xyz/nova/moontv/AdminActivity.java` | 管理端 |
| `src/xyz/nova/moontv/pusher/PushPanel.java` | 管理端的推送面板 |
| `res/raw/intro_hook.js` | 片头自动学习的注入脚本 |
| `AndroidManifest.xml` / `AndroidManifest-admin.xml` | 两端清单（版本号在这里改） |

### 发完必做

1. 新 APK 放服务器 `/data/app/Nova.apk`（管理端 `Nova-admin.apk`），由 nginx 直出
2. 改 `/data/app/update.json`（管理端 `admin-update.json`）里的 `versionCode` / `versionName` / `url`
3. 把新包按 `Nova-<版本>.apk` 命名提交到本仓库归档
4. 校验：`aapt2 dump badging` 看版本、`apksigner verify --print-certs` 看指纹

---

## 五、管理端后端

管理端所有请求走 `/app-admin/*`，由 nginx 反代到服务器上一个独立的 Python 服务：

| 项 | 说明 |
|---|---|
| 服务 | `appadmin.service`（systemd，常驻，自动重启） |
| 程序 | `/opt/appadmin/appadmin.py` |
| 端口 | 8099（nginx 把 `/app-admin/` 和 `/appcfg.json` 转过来） |
| 令牌文件 | `/opt/appadmin/token`（权限 600，只有 root 能读） |
| 主要接口 | 概览 `stats`、设备 `device`、推送 `upload`、版本 `release/*`、卡密 `card/*`、指令 `cmd` |

**注意**：早期判断「这套后端不存在」是错的——它不在站点代码里，但是一个独立服务，一直在跑。

---

## 六、踩过的坑（改代码前先看）

1. **包名不能有纯数字段**：`xyz.550556.nova` 会被 AAPT 拒绝，必须是 `xyz.nova.moontv` 这种。
2. **apksigner 参数名是 `--ks-key-alias`**，写成 `--key-alias` 会报 Unsupported option。
3. **管理端打包时 d8 不要带 libs 目录**，否则包体从 350KB 涨到 2.5MB。
4. **WebView 里 `window.open` 必须开 `setSupportMultipleWindows(true)`**，否则点影片会把搜索页顶掉。
5. **站点 HTML 是 `no-store`**，每次冷启动都要重新拉；静态 JS 是 18 小时缓存；图片走 `/api/image-proxy` 有半年缓存。
6. **服务器带宽只有 3M，只开了 gzip 没开 Brotli**，首屏约 300KB（压缩后）就是硬瓶颈。
7. **iOS/Android 手势**：全屏手势会拦截整个触摸事件，只要阈值松一点就会把点击吞掉。现在只在左右边缘 64dp 内响应。
8. **清缓存有 `cache_epoch` 开关**（`resetCacheIfUpgraded`），改版本号不会清缓存，要清就改这个数字。
9. **管理端卡密页、用户端授权页的代码还留在源码里**，只是入口移除了，属于死代码，编译无害。

---

## 七、还没做的事

| 事项 | 状态 | 说明 |
|---|---|---|
| 缓存优先秒开 | 未做 | 冷启动先用上次缓存内容立即显示，后台再刷新，能明显改善「打开就要等」 |
| 服务器 Brotli + 边缘缓存 | 未做 | 下载量再降约 20%，二次打开更快 |
| 设备上报 | 已停用 | 为降低杀软误报停掉了。副作用：管理端的概览/设备数据不再更新 |
| 网页手机端紫化改版 | 未部署 | 存档在 `nova-web-mobile-v1/` |
| 网站端遗留 | 已知 | 手机浏览器 localStorage 里还留有指向已删源的播放记录 |

---

## 八、安全说明

本仓库是**公开仓库**，所以以下内容一律不进仓库：

- 服务器地址、登录口令
- 签名密钥及其密码
- 管理员令牌

这些只在本地和服务器上保存：

| 内容 | 位置 |
|---|---|
| 正式签名密钥 | 本地密钥文件（单独备份，丢失后全量重签会要求用户重装） |
| 管理员令牌 | 服务器 `/opt/appadmin/token` |
| 服务器登录 | 自行保管，不写入任何文档或代码 |

---

*最后更新：2026-11-25*
