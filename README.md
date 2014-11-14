avalon.simpletree
=================
a simple plugin of tree based on AvalonJs

#Version
* 2014.11.10 : v0.1 参考了zTree,easyui.tree,oniUI.tree,加入了tree的基本功能<br>
* 2014.11.12 : v0.11 加入DblClick响应、数个可配置项（formatter,callback...）,重构了代码结构
    
#Configs
##Item设置
| Name   | Type   | Description|
|--------|--------|------------|
|name*   |String  |节点文本|
|href    |String  |节点链接 |
|isParent|Boolean |是否是父节点 |
|children|Array   |孩子节点| 

##Global设置
| Name                                  | Type      | Description|
|---------------------------------------|-----------|----------------|
| treeNodes                             | Array     | 一个/多个树节点 |
|contextMenu                            |Array      |右键菜单项<br>{ name : {String} ,<br>handle(data) : {Function}}|
|formatter(node)                        | Function  |格式化显示node的text/html |
|callback.onClick(data)                 | Function  |单击回调 |
| callback.onDblClick(data)             | Function  | 双击回调|
| callback.onCollapse(data)             | Function  | 收起回调|
| callback.onExpand(data)               |Function   |展开回调|
| callback.onSelect(data)               | Function  |选中回调|
| callback.onUnselect(data)             | Function  |取消选中回调 |
| callback.onContextmenu(data)          |Function   | 右键回调|
|onInit(vmodel, options, vmodels)       | Function  | 组件初始化回调|


#APIs
* 类似easyui.tree的API

##如何使用API

```html
<div ms-widget="simpletree,<组件实例名：可为任意名，$为随机名>,<组件实例的配置项名：为Model的变量名>"></div>
```

```javascript
avalon.vmodels[组件实例名].api();
```

| Name      | Parameters                | Return    |  Description          |
|-----------|---------------------------|-----------|-----------------------|
| getNode   |nodeId                     |  nodeVM   |获得Node Item          |
| insert    |nodeId, data, insertBefore | [nodeVM]  |在Node前面或者后面插入一组元素|
| append    |parentId, data             | [nodeVM]  |向Node下面插入一组元素，返回插入的元素|
|remove     | nodeId                    | nodeVM    |移除Node及其子Node|
| update    |nodeId, content            | none      |更新Node属性 |
| select    |nodeId                     | none      |选中Node |
| unselect  |nodeId                     | none      |取消选中Node |
|toggle     |nodeId                     |  none     |选中/取消选中Node|
|getSelected|                           |nodeVM/null|返回选中的Node |
| expand    | nodeId                    | none      |展开Node|
|collapse   | nodeId                    | none      |收起Node |
|expandAll  |                           | none      |展开所有Node |
|collapseAll|                           |  none     |收起所有Node|

#Usage
在网页中添加如下片段:<br>
```html
<div ms-widget="simpletree,$,$simpletreeOpt"></div>
<script>
    require(["./simpletree"],function(){
        avalon.define("test",function(vm){
            vm.$tree={children:[{name: 'Root Node',href:"#",children: 
                            [{name: 'Parent Node',href:"#",isParent : true,children: 
                                [{name: 'Leaf Node',href:"#"} ]}]}]}
            vm.$simpletreeOpt={
                treeNodes:vm.$tree.children,//所有的tree节点，暂时只支持JSON格式
                contextMenu:[{name:'New',handle:function(nodes,$event){//增加右键回调
                   //函数内容
                }},{name:'Delete',handle:function($event){//增加右键回调
                    //函数内容
                }}]}})
        avalon.scan();
    })
</script>
```
