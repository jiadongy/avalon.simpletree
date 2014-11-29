avalon.simpletree
=================
a simple plugin of tree based on AvalonJs

#Version
* 2014.11.10 : v0.1 参考了zTree,easyui.tree,oniUI.tree,加入了tree的基本功能<br>
* 2014.11.12 : v0.11 加入DblClick响应、数个可配置项（formatter,callback...）,重构了代码结构
* 2014.11.17 : v0.12 加入data可配置项，支持Simple和Normal两种节点输入格式，支持改变节点name，children，href字段名等
* 2014.11.21 : v0.2 基于事件代理统一了内置事件和插件事件的触发机制，加入编辑节点功能，fix右键菜单位置偏差，fix点击右键菜单项不传入nodeVM，fix在空白区域单击时也会触发click事件
    
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
|........idKey|String		|id|`'id'`|
|........pIdKey	|String		|parent Id|`'pId'`|
|........enable	|String		|enable/disable SimpleData|`false`|
|...*key*|Object		|Normal数据配置项||
|........children|String		|children|`children`|
|........name	|String		|name|`name`|	
|........url	|String		|href|`href`|
|**edit**		|Object		|编辑配置项||
|...enable|Boolean|enable Edit|`true`|
|...editNameSelectAll|Boolean		|select `name` text when edit|`true`|
|**callback**|Object		|回调函数配置项||
|...onClick(data) | Function  |单击回调 |`Noop`|
|...onClick(data) | Function  |单击回调 |`Noop`|
|...onDblClick(data) | Function  | 双击回调|`Noop`|
|...onCollapse(data) | Function  | 收起回调|`Noop`|
|...onExpand(data) |Function   |展开回调|`Noop`|
|...onSelect(data) | Function  |选中回调|`Noop`|
|...onUnselect(data) | Function  |取消选中回调 |`Noop`|
|...onContextmenu(data) |Function   | 右键回调|`Noop`|
|...beforeRename(data) |Function   | 编辑前回调|`Noop`|
|...onRename(data) |Function   | 编辑回调|`Noop`|
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
|$pId		    |Number			|父节点id，根节点为`"root"`|
|isRoot			|Boolean		|节点是否是根节点|
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
| beginEdit    | nodeId| none      |编辑Node的Name属性|`beginEdit(0)`|
| endEdit    | nodeId| none      |结束编辑Node并保存|`endEdit(0)`|
| cancelEdit    | nodeId| none      |结束编辑Node，不保存|`cancelEdit(0)`|

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


----------

#Event Dispatcher Rule
####处理过程
1. 将所有可能触发的事件按照优先级排序
2. 构造args参数{event,vmodel,vmodels}
3. 传入fliter，若没有有返回值且没有指定强制触发此事件，则跳过此事件
4. 将args传入fireReverse，若返回true，将执行反向事件，否则为正向事件
5. 若callbacks中存在相关事件，执行beforeEvent
6. 将args传入operation 
7. 若callbacks中存在相关事件，执行onEvent
8. 若callbacks中存在相关事件，执行afterEvent
9. 若stopNow不为true，调到下一事件的Step2


**Example:**
`eventExecuter(cmd, $event, focusDirection)`
* Parameters
	* `cmd` : 绑定在上面的事件,click,dblClick...
	* `$event` : Javascript Event对象 或者 Plain Object，前者为正常触发，后者为强制触发
	* `focusDirection` : true时指定为正向事件，false时指定为反向事件
* 强制触发
	* $event包含下列属性
		*  `eventName` ： 将要触发的事件Name
		*  `args` ： 可自定义传入的额外args，额外args会在Step2时合并到构造的args中去
		
```javascript
click: //绑定在click上的事件代理
[                        
	{
        priority: 2,						//此事件的优先级
        eventName: "expand",				//此事件的Name
        reverseName: "collapse",			//此事件的反向事件的Name
        stopNow: false,						//true时不再处理其后的事件
        fliter: function (args) {			//有返回值时表明此事件会被执行
            var target = args.event.target, nodeId;
            if (target.nodeName === "SPAN" && target.parentNode.nodeName === "LI") {
                nodeId = avalon(target.parentNode).attr('treeid');
                args.node = getNode(nodeId);
                return args;
            }
        },
        fireReverse: function (args) {		//返回true时表明触发此事件的反向事件
            return args.node.open
        },
        operation: function (args) {		//此事件真正的处理过程
            _toggleExpand(args.node.$treeid);
        }
    }
]
```