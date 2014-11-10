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

#APIs
类似easyui.tree的API
>getNode<br>
>insert<br>
>append<br>
>remove<br>
>update<br>
>select<br>
>unselect<br>
>toggle<br>
>getSelected<br>
>expand<br>
>collapse<br>
>expandAll<br>
>collapseAll<br>
