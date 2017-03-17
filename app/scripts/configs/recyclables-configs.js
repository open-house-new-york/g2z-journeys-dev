// configs
var journeyConfigs = {};
journeyConfigs.meta = {
  name: 'Recyclables',
  slug: 'recyclables',
  id: 1
};
journeyConfigs.firstPanelId = 'panel-0-1';
// journeyConfigs.visSteps = [
//   {
//     step: 1,
//     name: 'Collection',
//     id: '1-1'
//   },
// ];
journeyConfigs.mapEl = {
  visy: {
    id: '1-2'
  },
  sims: {
    id: '2-1'
  },
  recyexport: {
    id: '3-9'
  }
};
journeyConfigs.mapDataPath = 'data/recyclables.geojson';
journeyConfigs.mapConfigs = {};
