<div align="center">

# 七钥纪 · QiYaoJi

### 把一篇论文，读成七个有证据的答案。

游戏化论文精读工作台 · 七钥填空 · 研究地图 · 学习进度

[![Checks](https://github.com/lihongyu98/qiyaoji-customer/actions/workflows/check.yml/badge.svg)](https://github.com/lihongyu98/qiyaoji-customer/actions/workflows/check.yml)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-43853d)
![Preview](https://img.shields.io/badge/status-preview-c49a47)

[快速开始](#快速开始) · [七钥是什么](#七钥是什么) · [当前能力](#当前能力) · [参与改进](#参与改进)

</div>

读过摘要，却说不清方法为什么有效？收藏很多论文，却很少真正读完？

七钥纪把论文精读拆成可填写、可取证、可回看的小任务。你先解释问题与机制，再检查实验、结果与边界。地图、强化卡和学习进度提供反馈，**学习是主体，游戏是陪伴。**

这是从个人工作台整理出的学习者版本，保留海克斯风格的原有页面。当前公开的是可本地运行的预览源码，云端认证与模型服务仍需接入。

## 为什么试试七钥纪

- **从空白笔记到具体问题**：七钥继续细分为填空，明确下一步该读什么、写什么。
- **把理解和出处放在一起**：记录原文摘录与位置，区分作者主张、实验支持和自己的推测。
- **从列表走向研究地图**：保留世界模型知识树、论文目录、图解和研究专题入口。
- **有节奏地推进**：任务、角色角度、强化卡与学习进度帮助持续投入。
- **可选择的标注同步**：学习保存可在明确同意后进入待审队列；默认空配置不连接云端。

## 快速开始

安装 [Node.js](https://nodejs.org/) 22 或更高版本：

```sh
git clone https://github.com/lihongyu98/qiyaoji-customer.git
cd qiyaoji-customer
npm start
```

打开 **http://127.0.0.1:18806/desktop.html**。本地启动无运行依赖，不需要先执行 `npm install`，服务仅监听本机。

第一次体验：**选一篇熟悉的论文 → 打开七钥学习 → 从“靶子”开始填写 → 对照原文补充出处 → 继续“机制”和“证据”。** 不必一次填完全部内容。

> 草稿保存在浏览器。清理站点数据可能丢失记录；目前云端标注同步不等于完整草稿备份，不同浏览器的记录不会自动合并。

## 七钥是什么

| 钥匙 | 精读时要回答的问题 |
| --- | --- |
| 靶子 | 谁遇到了什么问题？怎样才算解决？ |
| 坐标 | 最接近的前人工作是什么？还缺哪一步？ |
| 主张 | 作者声称贡献了什么？新在哪里？ |
| 机制 | 输入如何经过关键步骤变成输出？依赖什么假设？ |
| 证据 | 哪个实验支持哪条主张？基线、消融是否充分？ |
| 数字 | 在什么数据、指标、协议和成本下取得结果？ |
| 边界 | 在哪些条件下成立？有哪些失败和未验证场景？ |

每个钥匙还有更细的子项。例如“机制”拆成输入、关键步骤、输出、训练目标与假设；“数字”要求同时记录比较条件，避免只记一个分数。

**规则候选 ≠ 模型语义理解 ≠ 人工核实。** 当前 `seven-keys.js` 的抽取是本地规则检索，返回待确认的原文候选；不是 LLM 全文精读，也不会证明论文结论正确。目录和研读材料同样需要回到原论文复核。

## 当前能力

| 模块 | 本仓库状态 |
| --- | --- |
| 原页面、七钥填空、研究地图、图解、学习进度入口 | 已包含，可本地体验 |
| 论文题录 | 包含 1045 篇目录；不捆绑 PDF |
| 本地学习草稿 | 浏览器存储；保留账号隔离逻辑 |
| 标注同步 | 包含同意、暂停、重试与去重逻辑；需云端配置与权限验证 |
| 邮箱注册与登录 | 依赖原 WorkBuddy Cloud；默认本地预览未接通 |
| AI 对照、评分和出题 | 界面保留；客户版模型后端尚未实现 |
| 在线体验站 / 桌面 EXE | 不由此仓库直接提供 |

本地服务对未实现的 API 返回 503，不生成占位评分。GitHub 公开源码不等于已部署可注册的线上服务。

## 开发与部署

```sh
npm install
npm run check
npm test
```

测试涵盖同意闸门、保存挂钩、待审提交、同意时间、角色追问、去重、暂停与服务器目录排除，不替代真实邮箱、数据库行级权限或生产环境验收。

| 文件 | 用途 |
| --- | --- |
| `public/seven-keys.js` | 七钥定义、填空指南与规则候选 |
| `public/customer-boot.js` | 客户版启动与账号存储隔离 |
| `public/customer-shell.js` | 同意与标注同步 |
| `public/assets/` | 题录、图解与素材 |
| `server.mjs` | 本机静态预览服务 |
| `tests/` | 客户版逻辑检查 |

WorkBuddy 部署时填写 `public/customer-config.js` 的 endpoint 与 publishableKey，仅使用可公开的客户端参数。生产配置应由部署过程注入，不提交 Git。不得放入管理密钥或模型密钥。

`ink_entries` 表需支持 uid、owner_id、pid、title、field、value、quote、anchor、evidence、audit、client。服务端必须根据认证身份约束 owner_id、强制 audit=pending、限制读取本人记录，并配置去重唯一约束。客户端约束不能替代数据库权限。管理员审核与导出应放在受保护的后台。

## 下一步

- [ ] 实现模型后端，支持带来源的全文对照与逐空反馈。
- [ ] 完成邮箱认证、数据库权限和管理员审核的端到端验证。
- [ ] 完善完整草稿的导出、恢复与迁移。
- [ ] 提供更清晰的新手引导与小屏体验。
- [ ] 逐步替换为权利明确、可再分发的原创视觉与音频素材。

## 参与改进

欢迎通过 [Issue](https://github.com/lihongyu98/qiyaoji-customer/issues/new/choose) 提交：读论文时卡住的具体步骤、可复现的 Bug、七钥设计建议，或题录与证据的纠错。请附复现步骤，不要上传个人笔记、账号凭证或未获授权的全文。

如果七钥纪让你更愿意读完一篇论文，欢迎 **Star**，也欢迎分享你的学习方法。最有帮助的反馈是：**“我读到哪一步，为什么停下来了？”**

## English overview

**QiYaoJi turns a paper into seven evidence-backed answers.** It is a gamified paper-reading workspace with a Chinese interface, guided blanks, research maps, illustrations and progress cues.

The seven keys cover problem, prior work, claims, mechanism, evidence, results and limitations. Requires Node.js 22+: clone this repo, run `npm start`, then open http://127.0.0.1:18806/desktop.html. No runtime dependencies.

This is a local preview. Email authentication and opt-in annotation sync require a configured cloud backend; the model backend is not implemented yet. Rule-based candidates are not verified annotations. Feedback and Stars are welcome.

## 素材、许可与归属

本项目是非官方学习工具，与 Riot Games / 英雄联盟无隶属或背书关系。游戏相关图像、角色和配音，以及论文材料的权利属于原权利人；公开仓库不代表获得商业使用或再分发授权。详见 [第三方说明](THIRD_PARTY_NOTICES.txt)。

当前未为整仓库授予统一开源许可证，**公开可见不等于任意使用许可**。使用或再分发前请分别核对代码与素材的权利范围。仓库不包含个人学习记录、API 密钥、生产连接参数、论文 PDF、Electron 安装包或宣传视频。
