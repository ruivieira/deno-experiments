/**
 * INFO: configuration builder for Apex charts
 */
export function TimeSeriesOptions(title: string, xlabel = "x"): ChartOptions {
  return {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      title: {
        text: xlabel,
      },
    },
    tooltip: {
      enable: false,
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "stepline",
      width: 1,
    },
    grid: {
      show: true,
      borderColor: "#333",
    },
    title: {
      text: title,
    },
  };
}

export type Point = { x: number; y: number }[];

export type Series = {
  name: string;
  data: Point;
};

export const makeRankData = function (series: Series[]) {
  const data = series.map((s) => {
    return {
      name: s.name,
      type: "line",
      data: s.data,
    };
  });

  console.log(data);

  return {
    options: TimeSeriesOptions("Rank history", "Timepoint"),
    data: data,
  };
};

interface XAnnotation {
  x: number;
  borderColor: string;
  label: any;
  text: string;
}

// deno-lint-ignore no-namespace
namespace Options {
  export interface Chart {
    id?: string;
    type: string;
    height?: number;
    animations?: {
      enabled?: false;
    };
    toolbar?: {
      show: boolean;
    };
    zoom?: {
      enabled: boolean;
    };
    events?: {
      click?: (event: any, chartContext: any, config: any) => void;
    };
  }
}

export interface AxisAnnotation {
  borderColor?: string;
  opacity?: number;
  label?: {
    borderColor?: string;
    style?: {
      color?: string;
      background?: string;
      fontSize?: string;
    };
    text: string;
  };
}

export interface XAxisAnnotation extends AxisAnnotation {
  x: number;
}

export interface YAxisAnnotation extends AxisAnnotation {
  y: number;
}

export interface ChartOptions {
  chart: Options.Chart;
  annotations?: {
    xaxis?: XAxisAnnotation[];
    yaxis?: YAxisAnnotation[];
  };
  colors?: string[];
  plotOptions?: any;
  dataLabels?: {
    enabled: boolean;
    formatter?: (val: number) => string;
    style?: any;
    offsetY?: number;
  };
  xaxis?: any;
  yaxis?: {
    max?: number;
    min?: number;
    reversed?: boolean;
    axisTicks?: any;
    tickAmount?: number;
    labels?: {
      show?: boolean;
      formatter?: (val: any) => string;
    };
    axisBorder?: any;
  };
  grid?: any;
  stroke?: any;
  tooltip?: any;
  title: {
    text: string;
    align?: string;
    style?: any;
  };
  markers?: {
    fillOpacity?: number | number[];
    strokeOpacity?: number | number[];
    size?: number | number[];
  };
}

export function createXAnnotation(
  value: number,
  text: string
): XAxisAnnotation {
  return {
    x: value,
    opacity: 0.5,
    borderColor: "#27631c",
    label: {
      borderColor: "#27631c",
      style: {
        color: "#fff",
        background: "#27631c",
        fontSize: "9px",
      },
      text: text,
    },
  };
}

export function createYAnnotation(
  value: number,
  text: string
): YAxisAnnotation {
  return {
    y: value,
    opacity: 0.5,
    borderColor: "#27631c",
    label: {
      borderColor: "#27631c",
      style: {
        color: "#fff",
        background: "#27631c",
        fontSize: "9px",
      },
      text: text,
    },
  };
}
