avalon.simpletree
=================

a simple plugin of tree based on AvalonJs
#Version
* 2014.11.10 : v0.1
    参考了zTree,easyui.tree,oniUI.tree,加入了tree的基本功能<br>

#Usage
在网页中添加如下片段:<br>
```html
<div ms-widget="simpletree,$,$simpletreeOpt"></div>
<script>
    require(["./simpletree"],function(){
        avalon.define("test",function(vm){
            vm.$tree={
                children:[
                    {name: 'Root Node',href:"#",
                        children: [
                            {name: 'Parent Node',href:"#",
                              isParent : true,
                                children: [
                                    {name: 'Leaf Node',href:"#"}
                                ]}
                        ]}
                ]
            }
            vm.$simpletreeOpt={
                treeNodes:vm.$tree.children,//所有的tree节点，暂时只支持JSON格式

                contextMenu:[{name:'New',handle:function(nodes,$event){//增加右键回调
                   //函数内容
                }},{name:'Delete',handle:function($event){
                    //函数内容
                }}]
            }
        })
        avalon.scan();
    })
</script>
```
#Configs
##Item设置
| Name | Type | Description|
|--------|--------|---------|
name   |String  |Node Text|
href    |String |Node Href |
children|Array  |Children Node| 

##Global设置
| Name | Type | Description|
|--------|--------|---------|
| treeNodes | Array | 一个/多个树节点 |
|contextMenu |Array |右键菜单 {name{String},handle(data){Function}|
|formatter(node) | Function|格式化显示node的text/html |
|callback.onClick(data) | Function|单击回调 |
| callback.onDblClick(data)| Function| 双击回调|
| callback.onCollapse(data)| Function| 收起回调|
| callback.onExpand(data) |Function |展开回调|
| callback.onSelect(data) | Function|选中回调|
| callback.onUnselect(data)| Function|取消选中回调 |
| callback.onContextmenu(data)|Function | 右键回调|
| onInit| Function| 组件初始化回调|


#APIs
类似easyui.tree的API
| Name | Parameters | Description|
|--------|--------|---------|
| getNode|nodeId |获得Node Item |
| insert|nodeId, data, insertBefore | 在Node前面或者后面插入一组元素|
| append|parentId, data | 向Node下面插入一组元素，返回插入的元素|
|remove | nodeId| 移除Node及其子Node|
| update|nodeId, content|更新Node属性 |
| select|nodeId |选中Node |
| unselect| | |
| | | |
| | | |
| | | |
| | | |
>getNode(nodeId)<br>
>>获得Node Item
>insert(nodeId, data, insertBefore)<br>
>>在Node前面或者后面插入一组元素
>append(parentId, data)<br>
>>向Node下面插入一组元素，返回插入的元素
>remove(nodeId)<br>
>>移除Node及其子Node
>update(nodeId, content)<br>
>>更新Node属性
>select(nodeId)<br>
>>选中Node
>unselect(nodeId)<br>
>>取消选中Node
>toggle(nodeId)<br>
>>选中/取消选中Node
>getSelected()<br>
>>返回选中的Node
>expand(nodeId)<br>
>>展开Node
>collapse(nodeId)<br>
>>收起Node
>expandAll()<br>
>>展开所有Node
>collapseAll()<br>
>>收起所有Node
