/**
 * Created by FeiyuLab on 2014/10/28 0028.
 */
define(['avalon', 'text!./simpletree.html', 'text!./simpletree.leaf.html', 'css!./simpletree.css'], function (avalon, treeTmpl, leafTmpl) {

    var eventList = ['click','contextmenu'],
        extentionMethods = [];

    var widget = avalon.ui.simpletree = function (element, data, vmodels) {

        var options = data["simpletree" + "Options"];
        options.tmpl = options.getTemplate(treeTmpl, options)
        options.leafTmpl = leafTmpl;

        var vmodel = avalon.define(data["simpletreeId"], function (vm) {

            vm.$skipArray = ['treeHash', 'selectedNode','treeid']
            vm.treeData = [];
            vm.contextMenu = [];
            vm.treeid = 0;
            vm.treeHash = {root:vm.treeData};
            //代码缩写，注意放在vm.xxx后。不能用var xxx=vm.xxx=[],否则xxx还是为[]，非VM
            var treeHash = vm.treeHash,
                treeData = vm.treeData,
                selectedNode,//当前选中的Node的VM
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
                vm.append("root", options.treeNodes);
                vm.contextMenu = options.contextMenu;
                avalon.scan(element, [vmodel].concat(vmodels));
                //onInit回调
                if (typeof  options.onInit === "function") {
                    options.onInit.call(element, vmodel, options, vmodels);
                }
            }
            vm.$remove = function () {
                element.innerHTML = element.textContent = "";
                avalon.unbind(document.body, "click", documentBindHandle);
                treeHash = null;
                selectedNode = null;
            }
            vm.loadLeafTemplate = function (leaf) {
                return options.leafTmpl;
            }
            /********************************数据控制方法**************************************************/
            vm.getNode = function (nodeId) {
                return treeHash[nodeId + ""];
            }
            /**
             * 在Node前面或者后面插入一组元素
             * @param nodeId
             * @param data
             * @param [insertBefore]
             */
            vm.insert = function (nodeId, data, insertBefore) {
                var node = treeHash[nodeId],
                    parent = nodeId != "root" ? treeHash[node.$pId] : "root",
                //若上一级是root，在treeData中插入，否则在children中插入
                    pChildren = nodeId != "root" ? parent.children : treeData;
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
             * 向Node下面插入一组元素
             * @param parentId
             * @param data
             * @returns {*}
             */
            vm.append = function (parentId, data) {
                var parent = parentId != "root" ? treeHash[parentId + ""] : "root";
                if (parent && data) {
                    //非root节点，挂在children下.root节点，直接挂在下面
                    var children = parentId != "root" ? parent.children : treeData;
                    var formatedData = formatTreeData.call(this, data, parent),
                        newLength = children.push.apply(children, formatedData);
                    _buildHash.call(this, children.slice(newLength - formatedData.length));//将新增的子树根节点VM加入hash
                    parent.open = true;//???如果open和isParent交换位置则append时parent节点样式错误（没有展开：显示为+号）
                    parent.isParent = true;
                }
                return parent;
            }
            /**
             * 移除Node及其子Node
             * @param nodeId ，"root"移除所有Node
             * @returns {*}
             */
            vm.remove = function (nodeId) {
                if (nodeId !== "root") {
                    var node = treeHash[nodeId + ""],
                        parent = treeHash[node.$pId],
                        findinThisArray = nodeId === "root" ? treeData : parent.children;
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
                    treeData.clear();
                    return treeData;
                }
            };
            /**
             * 更新Node属性
             * @param nodeId
             * @param content{object}
             */
            vm.update = function (nodeId, content) {
                var node = treeHash[nodeId];
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
                var node = treeHash[nodeId + ""];
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
                            ((selectedNode) && (selectedNode.selected = false)) || (selectedNode = node) ://增加
                            selectedNode = null;//删除
                    }
                }
            };
            vm.select = function (nodeId) {
                _toggleSelect(nodeId, true);
            }
            vm.unselect = function (nodeId) {
                _toggleSelect(nodeId, false);
            }
            vm.toggle = function (nodeId) {
                _toggleSelect(nodeId)
            }
            vm.getSelected = function () {
                return selectedNode;
            }
            /********************************展开相关方法******************************************************/
            function _toggleExpand(nodeId, valueForce) {
                var node = treeHash[nodeId + ""];
                if (node) {
                    node.open = valueForce !== undefined ? !!valueForce : !node.open;
                }
            }

            vm.expand = function (nodeId) {
                _toggleExpand(nodeId, true);
            }
            vm.collapse = function (nodeId) {
                _toggleExpand(nodeId, false);
            }
            vm.expandAll = function () {
                for (var param in treeHash) {
                    if (param != "root")
                        treeHash[param].open = true;
                }
            }
            vm.collapseAll = function () {
                for (var param in treeHash) {
                    if (param != "root")
                        treeHash[param].open = false;
                }
            }
            /**********************************鼠标相关函数*******************************************/
            vm.liveClick = function ($event) {
                var target = $event.target
                //Select
                if (target.parentNode.nodeName === "A") {//如果点击的是<a>
                    var nodeId = avalon(target.parentNode.parentNode).attr('treeid');//在<li>上
                    _toggleSelect(nodeId);
                }
                //Expand
                else if (target.nodeName === "SPAN" && target.parentNode.nodeName === "LI") {//如果点击的是<span>且上级为<li>
                    var treeid = avalon(target.parentNode).attr('treeid');//在<li>上
                    _toggleExpand(treeid);
                }
                //$event.stopPropagation();
            }
            vm.liveContextmenu = function ($event) {
                var target = $event.target;
                if (target.parentNode.nodeName === "A") {
                    var treeid = avalon(target.parentNode.parentNode).attr('treeid');//在<li>上
                    _toggleSelect(treeid, true);
                    var x = $event.clientX,
                        y = $event.clientY;
                    avalon.css(contextMenuElement, "left", x);
                    avalon.css(contextMenuElement, "top", y);
                    avalon.css(contextMenuElement, "display", "block");
                }
                //$event.stopPropagation();
                $event.preventDefault();
            }
            vm.contextMenuHandler = function ($event, menuIndex) {
                if ($event.target.nodeName === "A") {
                    var handle = vm.contextMenu[menuIndex].handle || avalon.noop;
                    handle.call(this, selectedNode, $event);
                    avalon.css(contextMenuElement, "display", "none");
                }
                $event.stopPropagation();
                $event.preventDefault();
            }






        });
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
            var that = this;
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
            var treeHash = this.treeHash;
            nodeVM.children.forEach(function (item) {
                delete treeHash[item.$treeid];
                if (item.children.length)
                    _removeHash.call(that, item.children);
            })
            delete treeHash[nodeVM.$treeid];
        }

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