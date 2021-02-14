export const getPlotData = (
  selectedDatasets: Array<{ label: string; labels: any; data: any }>,
  plotRelative: boolean
) => {
  const unifiedLabels = getUnifiedLabelsFromDatasets(selectedDatasets);

  // fill all datasets with zeros for dates where no data exists
  var plotDatasets = getPlotDatasets(
    selectedDatasets,
    unifiedLabels,
    plotRelative
  );

  const plotData = {
    labels: unifiedLabels,
    datasets: plotDatasets,
  };

  if (plotRelative) {
    plotData.datasets = normalizePlotDatasets(plotData.datasets);
  }
  return plotData;
};

export const getUnifiedLabelsFromDatasets = (selectedDatasets: any) => {
  // unify labels from all datasets
  var unifiedLabels: string[] = [];
  for (const dataset of selectedDatasets) {
    unifiedLabels = unifiedLabels.concat(dataset.labels);
  }
  unifiedLabels = Array.from(new Set(unifiedLabels));
  unifiedLabels.sort();
  return unifiedLabels;
};

export const getPlotDatasets = (
  selectedDatasets: { label: string; labels: any; data: any }[],
  unifiedLabels: string[],
  plotRelative: boolean
) => {
  const plotDatasets = [];
  for (const dataset of selectedDatasets) {
    const plotDataset: {
      label: string;
      data: Array<any>;
      borderColor: string;
      fill: boolean;
    } = {
      label: dataset.label,
      data: [],
      borderColor: randomColor(),
      fill: false,
    };

    for (const label of unifiedLabels) {
      const labelIndex: number = dataset.labels.indexOf(label);
      if (labelIndex > -1) {
        plotDataset.data.push(dataset.data[labelIndex]);
      } else {
        plotDataset.data.push(0);
      }
    }

    plotDatasets.push(plotDataset);
  }
  return plotDatasets;
};

export const normalizePlotDatasets = (
  plotDatasets: Array<{
    label: string;
    data: Array<any>;
    borderColor: string;
    fill: boolean;
  }>
) => {
  for (const plotDataset of plotDatasets) {
    const max: number = Math.max(...plotDataset.data);
    if (max > 0) {
      plotDataset.data = plotDataset.data.map((datum) => datum / max);
    }
  }
  return plotDatasets;
};

const randomColor = function () {
  var r = Math.floor(Math.random() * 230);
  var g = Math.floor(Math.random() * 230);
  var b = Math.floor(Math.random() * 230);
  return "rgb(" + r + "," + g + "," + b + ")";
};
