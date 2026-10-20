// 首页与完整版本列表共用此数据。NAS 地址确认后填入 nasUrl，留空时不显示备用入口。
window.CHARLY_RELEASES = [
  {
    version: '4.1', size: '284.10 MB',
    title: '熟悉的世界，新的小惊喜。',
    summary: '新增《稻草雕像》，更新部分模组，并调整快捷键。',
    githubUrl: 'https://github.com/CharlyWYF/charlymc/releases/tag/4.1',
    downloadUrl: 'https://github.com/CharlyWYF/charlymc/releases/download/4.1/Charly.4.1.zip',
    nasUrl: '',
    changes: [
      {type:'新增',title:'稻草雕像',text:'添加《稻草雕像》'},
      {type:'更新',title:'模组更新',text:'更新部分过时mod'},
      {type:'调整',title:'快捷键',text:'修改部分快捷键（长按`,`键：减小moss距离，提高帧率）'}
    ]
  },
  {
    version:'4.0',
    changes:[
      {type:'更新',title:'底层模组',text:'Fabric周边底层模组全面更新'},
      {type:'新增',title:'农夫乐事',text:'添加《农夫乐事》mod'},
      {type:'调整',title:'小地图',text:'调整小地图配置和快捷键'},
      {type:'调整',title:'光影',text:'默认开启光影包并优化，可按需关闭光影（按`O`键）'}
    ]
  },
  {
    version:'3.5',
    changes:[
      {type:'优化',title:'性能',text:'轻量优化性能实现小幅帧数上涨'},
      {type:'优化',title:'字体渲染',text:'优化ui字体渲染，更好的字体显示效果'},
      {type:'调整',title:'小地图',text:'调整小地图配置和快捷键，更清晰地找到其它玩家'},
      {type:'更新',title:'中文覆盖',text:'补充了一些i18n数据，中文覆盖更全面'},
      {type:'新增',title:'光影包',text:'添加光影包，为保流畅，默认不开启，可按需开启光影（按`O`键）'},
      {type:'调整',title:'资源包',text:'暂时禁用cocricot，此RP存在诸多明显bug'}
    ]
  },
  {
    version:'3.3',
    changes:[
      {type:'优化',title:'输入法',text:'优化卡输入法问题'},
      {type:'新增',title:'地图与传送',text:'增加大地图，小地图，可快捷传送'},
      {type:'新增',title:'方块信息',text:'增加方块原始id显示'},
      {type:'修复',title:'自动进服',text:'修复自动进入主服务器'}
    ]
  }
];
