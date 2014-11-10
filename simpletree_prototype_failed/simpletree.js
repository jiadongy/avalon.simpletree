/**
 * Created by FeiyuLab on 2014/11/9 0028.
 * 学习了：
 *  1.寄生组合式继承
 *  2.立即执行函数控制作用域
 *  3.prototype 和 constructor
 *  4.call和apply和this的大范围应用
 *  5.上下文，作用域链，VO，AO，this的关系与区别
 *  6.闭包如何产生，作用域链中的位置
 *
 * 失败原因：
 * 1.avalonJS本身并没有考虑把方法在实例间共享（可能因为大部分情况确实不必要），
 *      如在addAssign()判断方法是否存在是用hasOwnPrototpe而不是prop in scopr，编程起来不直观
 * 2.事件触发没法改变上下文的this，如单击时传入的liveClick(this..)是HTML Element，
 *      因此没法在liveClick内部获得vm的属性和方法（这个没法解决，除非将其重新移入VM中）
 * 
 * 2014.11.10 at RTIO Lab
 */
"use strict";
define(['avalon', 'text!./simpletree.html', 'text!./simpletree.leaf.html', 'css!./simpletree.css'], function (avalon, treeTmpl, leafTmpl) {

    var eventList = ['click','contextmenu'],//事件系统还没加完
        extentionMethods = [];
    /**
     * 为VM添加原型属性，优点：多实例时共享方法，缺点：复杂，mix和new需要额外的时间，应尽量减少VM中变量个数
     * 关键在方法中不要用vm.xxx去访问，而是要用this.xxx访问，因为方法体中使用了vm.xxx，就会在访问时持有vm的闭包
     * 主要思想就是偷天换日，因为VM是个Object了，不能直接修改其prototype（没有prototype，只有function才有），必须重新new一个出来
     * 这个方法编程起来也不直观，比较难理解。。。。唉
     * 2种共享方法的方法：闭包，调用时用call，方法内部用this拿值
     *                  原型，
     * 需要额外的编程量
     * 用立即执行函数保护私有变量
     */
    var changePrototyeOfVM = (function(){
        function PrototypeVM(){};//临时“类”，收集superType的prototype
        var prototypeInited = false;
        var execute = function(vm, superType){
            if(vm.$id && typeof superType === "function"){
                if(!prototypeInited){
                    PrototypeVM.prototype = superType.prototype;
                    PrototypeVM.prototype.constructor = Object;
                    PrototypeVM.prototype.$randomID = Math.random();
                }
                var that = new PrototypeVM();
                superType.call(that);//收集原型属性为实例属性
                avalon.mix(that, vm);
                prototypeInited = true;
                return that;
            }
        }
        return execute;
    })();
    /**
     * tree的共有方法，使用JS寄生组合式继承模式，借用构造函数+原型继承
     */
    var commonMethods = (function(){
        var methods = function(){//用于借用的构造器
            this.treeid=0;
        }
        /**
         /**********************************内部工具函数*******************************************
         * 2014.11.10 备注：将下列各个实例共用的函数移出vm，好处各实例共享节约内存，坏处增加代码复杂度
         *              调用时，需要显式call函数，传入vm本身为this来获得treeid和treeHash
         ***************************************************************************************/
        /**
         * 关键函数，由传入的简单数据数组生成tree内部的复杂数组，并映射成hash表用于搜索
         * @param treeData
         * @param parent
         * @private
         */
        function formatTreeData(treeData, parent) {
            var that = this;//缓存this，在forEach匿名函数用this为Global
            treeData = treeData instanceof Array ? treeData : [treeData];
            treeData.forEach(function (one) {
                formatItemData.call(that, one, parent);
                if (one.children && one.children.length)
                    formatTreeData.call(that, one.children, one);
            })
            return treeData;
        }
        /**
         * 关键函数，补全item字段
         * @param itemData
         * @param parent
         * @private
         */
        function formatItemData(itemData, parent) {
            itemData.$treeid = this.treeid++;
            itemData.$pId = parent != "root" ? parent.$treeid : parent;
            itemData.selected = false;
            itemData.isRoot = parent == "root";
            //必须保证每个item都有children，因为不能在vm外动态添加属性了,要先添加好！！
            itemData.children = itemData.children || [];
            //用户输入纠错
            itemData.isParent = parent != "root"
                ? itemData.isParent || (itemData.children && itemData.children.length)
                : true;
            itemData.open = itemData.isParent ? (itemData.open || true) : false;//父节点才能打开
            itemData.href = itemData.href || "javascript:void(0)";
            return itemData;
        }
        /**
         * 关键函数，hash所有itemVM方便查找
         * @param treeDataVM{Array}
         * @private
         */
        function _buildHash(treeDataVM) {
            var treeHash = this.treeHash,
                that = this;
            treeDataVM.forEach(function (one) {
                treeHash[one.$model.$treeid] = one;
                if (one.$model.children && one.$model.children.length)
                    _buildHash.call(that, one.children)
            })
        }
        /**
         * 关键函数，移除Node及其子Node的Hash
         * @param nodeVM{Object}
         * @private
         */
        function _removeHash(nodeVM) {
            var treeHash = this.treeHash,
                that = this;
            nodeVM.children.forEach(function (item) {
                delete treeHash[item.$treeid];
                if (item.children.length)
                    _removeHash.call(that, item.children);
            })
            delete treeHash[nodeVM.$treeid];
        }
        /********************************数据控制方法**************************************************/
        methods.prototype.getNode = function (nodeId) {
            return this.treeHash[nodeId + ""];
        }
        /**
         * 向Node下面插入一组元素
         * @param parentId
         * @param data
         * @returns {*}
         */
        methods.prototype.append = function (parentId, data) {
            var parent = parentId != "root" ? this.treeHash[parentId + ""] : "root";
            if (parent && data) {
                //非root节点，挂在children下.root节点，直接挂在下面
                var children = parentId != "root" ? parent.children : this.treeData;
                var formatedData = formatTreeData.call(this, data, parent),
                    newLength = children.push.apply(children, formatedData);
                _buildHash.call(this, children.slice(newLength - formatedData.length));//将新增的子树根节点VM加入hash
                parent.open = true;//???如果open和isParent交换位置则append时parent节点样式错误（没有展开：显示为+号）
                parent.isParent = true;
            }
            return parent;
        }
        /**
         * 在Node前面或者后面插入一组元素
         * @param nodeId
         * @param data
         * @param [insertBefore]
         */
        methods.prototype.insert = function (nodeId, data, insertBefore) {
            var node = this.treeHash[nodeId],
                parent = nodeId != "root" ? this.treeHash[node.$pId] : "root",
            //若上一级是root，在treeData中插入，否则在children中插入
                pChildren = nodeId != "root" ? parent.children : this.treeData;
            if (node && data) {
                var formatedData = formatTreeData.call(this, data, parent);
                for (var i = 0; i < pChildren.length; i++) {
                    if (pChildren[i].$treeid + "" === nodeId + "") {
                        var insertPosition = insertBefore ? i : i + 1;//如果当前i为0，则插入位置为0
                        pChildren._add(formatedData, insertPosition);
                        _buildHash.call(this,pChildren.slice(insertPosition, insertPosition + formatedData.length))
                        break;
                    }
                }
            }
        }
        /**
         * 移除Node及其子Node
         * @param nodeId ，"root"移除所有Node
         * @returns {*}
         */
        methods.prototype.remove = function (nodeId) {
            if (nodeId !== "root") {
                var node = this.treeHash[nodeId + ""],
                    parent = this.treeHash[node.$pId],
                    findinThisArray = nodeId === "root" ? this.treeData : parent.children;
                _removeHash.call(this, node);
                for (var i = 0; i < findinThisArray.length; i++) {
                    if (findinThisArray[i].$treeid + "" === nodeId + "") {
                        findinThisArray.removeAt(i);
                        break;
                    }
                }
                return node;
            }
            else {
                this.treeData.clear();
                return this.treeData;
            }
        };
        /**
         * 更新Node属性
         * @param nodeId
         * @param content{object}
         */
        methods.prototype.update = function (nodeId, content) {
            var node = this.treeHash[nodeId];
            if (node && avalon.type(content) == "object")
                avalon.mix(node, content);
        }
        /*****************************选中相关方法***********************************************************/
        /**
         * 设置Node选中状态
         * @param nodeId
         * @param [valueForce] 强制设置选中状态，否则默认行为为toggle
         * @private
         */
        function _toggleSelect(nodeId, valueForce) {
            var node = this.treeHash[nodeId + ""];
            if (node) {
                if (node.selected != valueForce) {//如果要toggle
                    switch (valueForce) {
                        case false:
                        case true:
                            node.selected = valueForce;
                            break;
                        case undefined:
                            node.selected = !node.selected;
                            break;
                        default:
                    }
                    node.selected === true ?//加入到selectedNodes中方便查询
                        ((this.selectedNode) && (this.selectedNode.selected = false)) || (this.selectedNode = node) ://增加
                        this.selectedNode = null;//删除
                }
            }
        };
        methods.prototype.select = function (nodeId) {
            _toggleSelect.call(this, nodeId, true);
        }
        methods.prototype.unselect = function (nodeId) {
            _toggleSelect.call(this, nodeId, false);
        }
        methods.prototype.toggle = function (nodeId) {
            _toggleSelect.call(this, nodeId)
        }
        methods.prototype.getSelected = function () {
            return this.selectedNode;
        }
        /********************************展开相关方法******************************************************/
        function _toggleExpand(nodeId, valueForce) {
            var node = this.treeHash[nodeId + ""];
            if (node) {
                node.open = valueForce !== undefined ? !!valueForce : !node.open;
            }
        }

        methods.prototype.expand = function (nodeId) {
            _toggleExpand.call(this, nodeId, true);
        }
        methods.prototype.collapse = function (nodeId) {
            _toggleExpand.call(this, nodeId, false);
        }
        methods.prototype.expandAll = function () {
            for (var param in this.treeHash) {
                if (param != "root")
                    this.treeHash[param].open = true;
            }
        }
        methods.prototype.collapseAll = function () {
            for (var param in this.treeHash) {
                if (param != "root")
                    this.treeHash[param].open = false;
            }
        }
        /**********************************鼠标相关方法*******************************************/
        methods.prototype.liveClick = function ($event) {
            var target = $event.target
            //Select
            if (target.parentNode.nodeName === "A") {//如果点击的是<a>
                var nodeId = avalon(target.parentNode.parentNode).attr('treeid');//在<li>上
                _toggleSelect.call(this, nodeId);
            }
            //Expand
            else if (target.nodeName === "SPAN" && target.parentNode.nodeName === "LI") {//如果点击的是<span>且上级为<li>
                var treeid = avalon(target.parentNode).attr('treeid');//在<li>上
                _toggleExpand.call(this, treeid);
            }
            //$event.stopPropagation();
        }
        methods.prototype.liveContextmenu = function ($event) {
            var target = $event.target;
            if (target.parentNode.nodeName === "A") {
                var treeid = avalon(target.parentNode.parentNode).attr('treeid');//在<li>上
                _toggleSelect.call(this, treeid, true);
                var x = $event.clientX,
                    y = $event.clientY;
                avalon.css(this.contextMenuElement, "left", x);
                avalon.css(this.contextMenuElement, "top", y);
                avalon.css(this.contextMenuElement, "display", "block");
            }
            //$event.stopPropagation();
            $event.preventDefault();
        }
        methods.prototype.contextMenuHandler = function ($event, menuIndex) {
            if ($event.target.nodeName === "A") {
                var handle = this.contextMenu[menuIndex].handle || avalon.noop;
                handle.call(this, this.selectedNode, $event);
                avalon.css(this.contextMenuElement, "display", "none");
            }
            $event.stopPropagation();
            $event.preventDefault();
        }
        return methods;
    })()

    var widget = avalon.ui.simpletree = function (element, data, vmodels) {

        var options = data["simpletree" + "Options"];
        options.tmpl = options.getTemplate(treeTmpl, options)
        options.leafTmpl = leafTmpl;

        var vmodel = avalon.define(data["simpletreeId"], function (vm) {

            vm.$skipArray = ['treeHash', 'selectedNode','treeid','contextMenuElement']
            vm.treeData = [];
            vm.contextMenu = [];
            vm.contextMenuElement=null;
            vm.treeHash = {root:vm.treeData};
            //代码缩写，注意放在vm.xxx后。不能用var xxx=vm.xxx=[],否则xxx还是为[]，非VM
            var selectedNode,//当前选中的Node的VM
                contextMenuElement,//右键菜单元素
                inited = false,
                documentBindHandle;//bind的函数，方便$remove()卸载

            /******************************组件创建/销毁方法************************************************/
            vm.$init = function () {
                if (inited) return;
                inited = true;
                element.innerHTML = options.tmpl;
                contextMenuElement = element.getElementsByClassName("menu")[0];
                //点击空白处右键菜单自动消失
                documentBindHandle = avalon.bind(document.body, "click", function (e) {
                    if (!avalon.contains(contextMenuElement, e.target))
                        avalon.css(contextMenuElement, "display", "none");
                })
                //添加数据
                this.append("root", options.treeNodes);
                this.contextMenu = options.contextMenu;
                avalon.scan(element, [vmodel].concat(vmodels));
                //onInit回调
                if (typeof  options.onInit === "function") {
                    options.onInit.call(element, vmodel, options, vmodels);
                }
            }
            vm.$remove = function () {
                element.innerHTML = element.textContent = "";
                avalon.unbind(document.body, "click", documentBindHandle);
                this.treeHash = null;
                selectedNode = null;
            }
            vm.loadLeafTemplate = function (leaf) {
                return options.leafTmpl;
            }
        });
        vmodel = avalon.vmodels[data["simpletreeId"]] = changePrototyeOfVM(vmodel,commonMethods);
        return vmodel;
    }

    function upperFirstLetter(str) {
        return str.replace(/^[a-z]{1}/g, function(mat) {
            return mat.toUpperCase()
        })
    }

    widget.defaults = {
        treeNodes: [],//@param 树的所有节点，支持JSON格式
        contextMenu: [],
        /*
        view: {//@param 视觉效果相关的配置
            showLine: true,//@param view.showLine是否显示连接线
            dblClickExpand: true,//@param view.dblClickExpand是否双击变化展开状态
            selectedMulti: true,//@param view.selectedMulti true / false 分别表示 支持 / 不支持 同时选中多个节点
            showIcon: true,//@param view.showIcon zTree 是否显示节点的图标
            showTitle: true,//@param view.showTitle 分别表示 显示 / 隐藏 提示信息
            nameShower: function (leaf) {
                return leaf.name
            }//@optMethod view.nameShower(leaf)节点显示内容过滤器，默认是显示leaf.name
        },
        callback: {//@param 回调相关的配置
            //@optMethod callback.onExpand(data) 节点展开回调
            //@optMethod callback.onCollapse(data) 节点收起回调
            //@optMethod callback.onSelect(data) 节点被选中回调
            //@optMethod callback.onClick(data) 节点被点击回调
            //@optMethod callback.onDblClick(data) 节点被双击回调
        },*/
        onInit: avalon.noop,
        getTemplate: function (tmpl, opts, tplName) {
            return tmpl;
        }

    }
})