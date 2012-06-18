gxp.data.GBoundariesModel =[
	{name: 'ADM0NAME' },
	{name: 'ADM0_CODE' },
	{name: 'CONTINENT_' },
	{name: 'COUNT' },
	{name: 'EXPIRY_Y' },
	{name: 'LAST_UPD' },
	{name: 'REGION_' }
];

/**
 * Composite entry for the country grid
 *
 */
gxp.data.FraDataEntry = Ext.data.Record.create([
	{name: 'ADM0NAME' },
	{name: 'ADM0_CODE' },
	{name: 'CONTINENT_' },
	{name: 'COUNT' },
	{name: 'EXPIRY_Y' },
	{name: 'LAST_UPD' },
	{name: 'REGION_' },
	{name: 'data' }

])

/**
  * Fra Visible attributes
  */
  
gxp.data.VisibleAttributeModel=[
			 {name: 'forest_area_primary', label: 'Forest Area Primary'},
			 {name: 'forest_area_planted', label: 'Forest Area Planted' },
			 {name: 'forest_area2', label: 'forest Area 2'},
			 {name: 'forest_aboveground_biomass',label:'Forest Aboveground Biomass'},

			 {name: 'forest_area_protectedareas', label: 'Forest Area Protected Areas' },
			 {name: 'forest_belowground_biomass', label: 'Forest Belowground Biomass' },
			 {name: 'forest_carbon_aglb', label: 'Forest Carbon aglb' },
			 {name: 'forest_growing_stock', label: 'Frest Growing Stock' },
			 {name: 'inland_water_area', label: 'inland water area' },
			 {name: 'other_land_area', label: 'other land area' },
			 {name: 'other_wooded_land_aboveground_biomass', label: 'other wooded land aboveground biomass' },
			 {name: 'other_wooded_land_area', label: 'other wooded land area' },
			 {name: 'other_wooded_land_belowground_biomass', label: 'other wooded land belowground biomass' },
			 {name: 'other_wooded_land_carbon_aglb', label: 'other wooded land carbon aglb' },
			 {name: 'other_wooded_land_growingstock', label: 'other wooded land growingstock' }
];


gxp.data.fraAttributeModel = gxp.data.VisibleAttributeModel.concat([{name: 'year', label: 'Year'}, {name: 'gaulcode', label: 'gaulcode' }]);


gxp.data.fraRecord = Ext.data.Record.create(gxp.data.fraAttributeModel);
