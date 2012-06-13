/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = AddGroup
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: ComputeStatAction(config)
 *
 *    Plugin for adding a new group on layer tree.
 */
gxp.plugins.ComputeStatsAction = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_computestats */
    ptype: "gxp_computestats",
    
    /** api: config[ComputeStatsActionMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    computeStatsActionMenuText: "Add Group",

    /** api: config[ComputeStatsActionActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    computeStatsActionActionTip: "Add a new group in the layer tree",
    
    computeStatsActionDialogTitle: "Statistics",
    
    computeStatsActionFieldSetText: "Group Name",
    
    computeStatsActionFieldLabel: "New Group",
    
    computeStatsActionButtonText: "Add Group",
    
    computeStatsActionMsg: "Please enter a group name",

    /** 
     * api: method[addActions]
     */
    addActions: function() {
        var apptarget = this.target;
        
        var actions = gxp.plugins.ComputeStatsAction.superclass.addActions.apply(this, [{
            menuText: this.computeStatsActionActionTipMenuText,
            iconCls: "gxp-icon-computestats",
			text: "Compute Statistics",
            disabled: false,
            tooltip: this.computeStatsActionActionTip,
            handler: function() {
                
                var enableBtnFunction = function(){
                    if(this.getValue() != "")
                        Ext.getCmp("group-addbutton").enable();
                    else
                        Ext.getCmp("group-addbutton").disable();
                };
                
                if(this.win)
                    this.win.destroy();

                this.win = new Ext.Window({
                    width: 700,
                    height: 500,
                    title: this.computeStatsActionDialogTitle,
                    constrainHeader: true,
                    renderTo: apptarget.mapPanel.body,
                    items: [
                        //TODO
                    ]
                   
                });
                
                this.win.show();
            },
            scope: this
        }]);
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.ComputeStatsAction.prototype.ptype, gxp.plugins.ComputeStatsAction);
