# Nova Web 手机端 v1（design/mobile-v1）

归档时间：2026-11-17
仓库：`ffuufuu/nova-cinema` · 分支 `design/mobile-v1` · 最新提交 `1d5aad1`
测试站：已关闭（`test.550556.xyz`，容器与网络已删除，数据卷保留）
正式站：未部署本轮改动

## 本轮做了什么

前台
- 紫蓝手机首页（分类 tab / Hero 轮播 / 快捷卡 / 热播横滑 / 推荐 chip），桌面端未动
- 四入口：搜索、源站寻片、求片、观影室
- 新路由：`/discover`、`/detail`、`/my`
- 底部导航重写为 3 tab（首页 / 发现 / 我的），深紫底 + 紫渐变指示条
- 全站紫化：`--theme-primary: #7C3AED`；6 种绿色 hex 与 green 类全部映射为紫（含 border/ring/focus）
- 播放页加载符阵由绿变紫（改主题变量即可，无需改组件）
- 搜索页重构：40px 紫胶囊搜索框、结果头一行、筛选 chip 胶囊、高级面板深紫卡片
- 选集区：选集/换源 tab 紫化、分段按钮紫色发光下划线、集数按钮紫渐变

后台
- 卡片式首页：横幅 + 4 真实数据卡（用户 / 视频源 35 / 求片 / 分类）+ 15 面板入口
- 去掉底部 5 tab，header 加「回前台」
- 15 面板全部走 `iframe /admin?embed=1&section=<key>`，加载原版组件本体
- 原版后台手机内嵌适配：grid 单列、输入框 42px、按钮 34px、表格横滑、深紫主题

15 面板 key 与原版 nav 完全一致：
`configFile` `siteConfig` `registrationConfig` `themeConfig` `userConfig` `videoSource` `sourceScriptLab` `liveSource` `webLive` `movieRequests` `animeSubscription` `emailConfig` `categoryConfig` `customAdFilter` `dataMigration`

## 遗留问题

1. **【核心】手机内嵌面板滑动失效**：真机上进面板后划不动，看不到底部保存按钮。三种修法均失败（iframe 固定高度+内部滚动 / 放开 html·body 滚动 / iframe 内容全高+外层整页滚动）。桌面模拟下第三种有效，真机无效。**下次建议放弃 iframe，改为把原版面板组件直接渲染到卡片页。**
2. 「配置文件」拉取配置失败弹窗居中遮挡表单；订阅地址返回 HTML 而非 JSON+Base58，必然失败
3. 后台内嵌表格需横滑；视频源 8 个批量按钮折三行
4. 搜索页海报角标仍棕黄底；卡片标题截断
5. 首页 Hero 偶发空白（未查）
6. 动漫/番剧页（每日放送、周表）未做；加载态与空状态未统一
7. `src/components/admin-new/` 残留未被引用的文件

## 部署流程

```
推 design/mobile-v1
→ GitHub Actions 手动跑 docker-build.yml（必须手选分支；正常 7-9 分钟）
→ docker pull ghcr.io/ffuufuu/nova-cinema:latest
→ cd /opt/nova-test && docker compose up -d --force-recreate nova-test-core
```

## 关键实现备忘

- 全站主题色：`globals.css` 首行 `:root{--theme-primary:#7C3AED}`；加载符阵 `--mtv-acc` 引用它，未定义回落绿色 `#10b981`（这就是「播放页六芒星是绿的」根因）
- 加载款式：`layout.tsx` 读 `ThemeConfig?.loadingStyle`（`classic|grid|talisman`，兜底 `talisman`）
- 后台 embed：`app/admin/page.tsx` 的 `AdminPageClient` 读 `?embed=1&section=xxx` 直接 return 面板，不套 `PageLayout`
- 源配置同步：`docker exec moontv-kvrocks redis-cli -p 6666 --raw GET admin:config`（13332 字节）→ 写入目标 kvrocks
