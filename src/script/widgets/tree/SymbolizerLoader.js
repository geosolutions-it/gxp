Ext.ns("gxp.tree");

/**
 * @requires widgets/tree/TreeGridNodeUI.js
 */

gxp.tree.SymbolizerLoader = function(config) {
    Ext.apply(this, config);
    gxp.tree.SymbolizerLoader.superclass.constructor.call(this);
};

Ext.extend(gxp.tree.SymbolizerLoader, Ext.util.Observable, {

    symbolizers: null,

    /** private: method[load]
     *  :param node: ``Ext.tree.TreeNode`` The node to add children to.
     *  :param callback: ``Function``
     */
    load: function(node, callback) {
        if(this.fireEvent("beforeload", this, node)) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }

            var divTpl = new Ext.Template('<div id="{id}"></div>');
            for (var i=0, ii=this.symbolizers.length;i<ii;++i) {
                var symbolizer = symbolizers[i];
                var key = symbolizer.CLASS_NAME.substring(symbolizer.CLASS_NAME.lastIndexOf(".")+1);
                var fullSymbolizer = symbolizer.clone();
                if (key === 'Text') {
                    fullSymbolizer.label = "Ab";
                    if (fullSymbolizer.fillColor || fullSymbolizer.graphicName) {
                        fullSymbolizer.graphic = true;
                    }
                }
                var id = Ext.id();
                var child = this.createNode({
                    type: key, 
                    expanded: true, 
                    rendererId: id, 
                    symbolizer: fullSymbolizer, 
                    iconCls: 'gxp-icon-symbolgrid-' + key.toLowerCase(),
                    preview: divTpl.applyTemplate({id: id})
                });
                if (key === "Polygon" || key === "Point") {
                    id = Ext.id();
                    var strokeSym = fullSymbolizer.clone();
                    strokeSym.fill = false;
                    child.appendChild(this.createNode({
                        checked: fullSymbolizer.stroke !== undefined ? fullSymbolizer.stroke : true,
                        iconCls: "gxp-icon-symbolgrid-none",
                        type: 'Stroke', 
                        symbolizer: strokeSym,
                        rendererId: id, 
                        preview: divTpl.applyTemplate({id: id})
                    }));
                    id = Ext.id();
                    var fillSym = fullSymbolizer.clone();
                    fillSym.stroke = false;
                    child.appendChild(this.createNode({
                        checked: fullSymbolizer.fill !== undefined ? fullSymbolizer.fill : true,
                        iconCls: "gxp-icon-symbolgrid-none",
                        type: 'Fill', 
                        symbolizer: fillSym,
                        rendererId: id, 
                        preview: divTpl.applyTemplate({id: id})
                    }));
                } else if (key === "Line") {
                    id = Ext.id();
                    child.appendChild(this.createNode({
                        type: 'Stroke',
                        iconCls: "gxp-icon-symbolgrid-blank",
                        symbolizer: fullSymbolizer.clone(),
                        rendererId: id,
                        preview: divTpl.applyTemplate({id: id})
                    }));
                } else if (key === "Text") {
                    id = Ext.id();
                    var labelSym = fullSymbolizer.clone();
                    labelSym.graphic = false;
                    child.appendChild(this.createNode({
                        checked: true,
                        iconCls: "gxp-icon-symbolgrid-none",
                        type: 'Label',
                        symbolizer: labelSym,
                        rendererId: id,
                        preview: divTpl.applyTemplate({id: id})
                    }));
                    id = Ext.id();
                    var graphicSym = fullSymbolizer.clone();
                    graphicSym.label = "";
                    child.appendChild(this.createNode({
                        checked: fullSymbolizer.graphic,
                        iconCls: "gxp-icon-symbolgrid-none",
                        type: 'Graphic',
                        symbolizer: graphicSym,
                        rendererId: id,
                        preview: divTpl.applyTemplate({id: id})
                    }));
                }
                node.appendChild(child);
            }
            if(typeof callback == "function"){
                callback();
            }

            this.fireEvent("load", this, node);
        }
    },

    /** api: method[createNode]
     *  :param attr: ``Object`` attributes for the new node
     *
     *  Override this function for custom TreeNode node implementation, or to
     *  modify the attributes at creation time.
     */
    createNode: function(attr) {
        if(this.baseAttrs){
            Ext.apply(attr, this.baseAttrs);
        }
        if (!attr.uiProvider) {
            attr.uiProvider = gxp.tree.TreeGridNodeUI;
        }
        attr.nodeType = attr.nodeType || "node";
        return new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);
    }

});
