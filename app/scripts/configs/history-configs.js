// configs
var journeyConfigs = {};
journeyConfigs.meta = {
  name: 'History of NYC\'s Waset',
  slug: 'history',
  id: 2
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
  }
];
journeyConfigs.mapEl = {
  // nyc: {
  //   id: '1-3'
  // },
  dumpingWharves: {
    id: '2-2',
    slug: 'dumping-wharves'
  },
  landfillsNyc: {
    id: '2-8',
    slug: 'landfills-nyc'
  },
  transferStations: {
    id: '4-2',
    slug: 'transfer-stations'
  }
};
journeyConfigs.mapDataPath = 'data/history.geojson';
journeyConfigs.mapConfigs = {};
