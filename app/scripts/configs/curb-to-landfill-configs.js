// configs
var journeyConfigs = {};
journeyConfigs.meta = {
  name: 'From Curb to Lanfill',
  slug: 'curb-to-landfill',
  id: 1
};
journeyConfigs.firstPanelId = 'panel-0-1';
journeyConfigs.visSteps = [
  {
    step: 1,
    name: 'Collection',
    id: '1-1'
  },
  {
    step: 2,
    name: 'Transfer',
    id: '2-1'
  },
  {
    step: 3,
    name: 'Export',
    id: '3-1'
  },
  {
    step: 4,
    name: 'Disposal',
    id: '4-1'
  }
];
journeyConfigs.mapEl = {
  nyc: {
    id: '1-4'
  },
  wasteExport: {
    id: '3-4'
  }
};
journeyConfigs.mapDataPath = 'data/curb-to-landfill.geojson';
journeyConfigs.mapConfigs = {};
