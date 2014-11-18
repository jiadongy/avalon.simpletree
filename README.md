avalon.simpletree
=================
a simple plugin of tree based on AvalonJs

#Version
* 2014.11.10 : v0.1 参考了zTree,easyui.tree,oniUI.tree,加入了tree的基本功能<br>
* 2014.11.12 : v0.11 加入DblClick响应、数个可配置项（formatter,callback...）,重构了代码结构
* 2014.11.17 : v0.12 加入data可配置项，支持Simple和Normal两种节点输入格式，支持改变节点name，children，href字段名等
    
#Configs
* 类似zTree的配置项

##Item设置
| Name   | Type   | Description|
|--------|--------|------------|
|name*   |String  |节点文本|
|href    |String  |节点链接 |
|open    |Boolean  |是否打开 |
|isParent|Boolean |是否是父节点 |
|children|Array   |孩子节点| 

##Global设置
| Name                                  | Type      | Description|Default|
|---------------------------------------|-----------|----------------|----|
|**treeNodes**| Array     | 初始化树节点 |`[]`|
|**contextMenu**|Array      |右键菜单项配置项<br>`{ name : {String} ,handle(data) : {Function}}`|`[]`|
|**view**|Object|显示配置项||
|...nameShower|Function|格式化节点的Name(Html格式）|`返回节点的name`|
|**data**|Object		|数据配置项||
|...*simpleData*|Object|Simple数据配置项||
|........idKey|Object		|id|`'id'`|
|........pIdKey	|Object		|parent Id|`'pId'`|
|........enable	|Object		|enable/disable SimpleData|`false`|
|...*key*|Object		|Normal数据配置项||
|........children|Object		|children|`children`|
|........name	|Object		|name|`name`|	
|........url	|Object		|href|`href`|
|**callback**|Object		|回调函数配置项||
|...onClick(data) | Function  |单击回调 |`Noop`|
|...onClick(data) | Function  |单击回调 |`Noop`|
|...onDblClick(data) | Function  | 双击回调|`Noop`|
|...onCollapse(data) | Function  | 收起回调|`Noop`|
|...onExpand(data) |Function   |展开回调|`Noop`|
|...onSelect(data) | Function  |选中回调|`Noop`|
|...onUnselect(data) | Function  |取消选中回调 |`Noop`|
|...onContextmenu(data) |Function   | 右键回调|`Noop`|
|**onInit(vmodel, options, vmodels)**| Function  | 组件初始化回调|`Noop`|

###Callback Function Parameter
* 传入的是一个Object，有下列属性

|Attribute Name	|Type			|Description|
|---------------|---------------|------------|
|event*		|DOM Event			|触发的事件|
|node		|nodeObject			|回调相关的节点，若点击在空白处则无此项|
|vmodel*	|VM Object			|此实例的vmodel|
|vmodels*	|Array of VM Object|此实例的作用域vmodel数组|

###NodeObject Private Attributes
* Node保存的一些内部变量，用户可以读取使用，最好不要修改

|Attribute Name	|Type			|Description|
|---------------|---------------|------------|
|$treeid		|Number			|递增的节点id|
|$pId		    |Number			|递增的节点id，根节点为`"root"`|
|select		    |Boolean		|节点是否选中|

#APIs
* 类似easyui.tree的API

##About Node Id
* nodeId是在API中访问node的唯一方式

####获得NodeId
1. **From JS**	: 	`nodeObject.$treeid`
2. **From DOM**	:	element的DOM结构如下`<li treeid="2">...</li>`<br>通过jQuery方法`$(element).attr("treeid")`，<br>或者原生Javascript方法`element.getAttribute("treeid")`获得

##如何使用API

```html
<div ms-widget="simpletree,<组件实例名：可为任意名，$为随机名>,<组件实例的配置项名：为Model中的某个变量名>"></div>
```

```javascript
avalon.vmodels[组件实例名].api(arguments...);
```

| Name      | Parameters     | Return    |  Description |Example|
|-----------|----------------|-----------|--------------|--------|
| getNode   |nodeId  |  nodeObject   |获得Node Item |`getNode(1)`<br>`getNode("root")`|
| insert    |nodeId, data, insertBefore | [nodeObject]  |在Node前面或者后面插入一组元素|`insert(0,{name:"test",open:true,isParent:false,chilren:[{name:"test2"}]},true)`<br>`insert("root",{name:"test3",open:true})`|
| append    |parentId, data | [nodeObject]  |向Node下面插入一组元素，返回插入的元素|`append(1,{name:"test6"})`|
|remove     | nodeId  | nodeObject    |移除Node及其子Node|`remove(0)`<br>`remove("root")`|
| update    |nodeId, content| none      |更新Node属性 |`update(0,{name:"newTest"})`|
| select    |nodeId| none      |选中Node |`select(0)`|
| unselect  |nodeId  | none      |取消选中Node |`unselect(0)`|
|toggle     |nodeId |  none     |选中/取消选中Node|`toggle(0)`|
|getSelected| *noParameters* |nodeObject/null|返回选中的Node |`getSelected()`|
| expand    | nodeId| none      |展开Node|`expand(0)`|
|collapse   | nodeId | none      |收起Node |`collapse(0)`|
|expandAll  | *noParameters* | none      |展开所有Node |`expandAll()`|
|collapseAll| *noParameters*  |  none     |收起所有Node|`collapseAll()`|

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
                contextMenu:[{name:'New',handle:function(data){//增加右键回调
                   //函数内容
                }},{name:'Delete',handle:function(data){//增加右键回调
                    //函数内容
                }}]}})
        avalon.scan();
    })
</script>
```
