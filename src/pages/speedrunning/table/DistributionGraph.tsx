import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTime } from '../../speedrunning/utils';
import styles from '../../Speedrunning.module.css';

type DistributionGraphProps = {
  seconds: Array<number | null | undefined>;
};

type DistributionPoint = {
  midpoint: number;
  count: number;
  start: number;
  end: number;
};

type RangeSelection = {
  startIndex: number;
  endIndex: number;
};

type TooltipPayload = {
  active?: boolean;
  label?: number;
  payload?: Array<{
    payload: DistributionPoint;
    value: number;
  }>;
};

const MIN_ROWS = 30;
const MIN_BINS = 12;
const MAX_BINS = 24;
const OVERVIEW_BINS = 24;

const BIN_PRESETS = [
  { label: 'Wide', bins: 12 },
  { label: 'Balanced', bins: 18 },
  { label: 'Fine', bins: 24 },
] as const;

function buildDistribution(
  values: number[],
  targetBins: number,
  minimumRows = MIN_ROWS,
) {
  if (values.length <= minimumRows) {
    return null;
  }

  const min = values[0];
  const max = values[values.length - 1];
  const range = max - min;

  if (range <= 0) {
    return null;
  }

  const binCount = Math.min(
    MAX_BINS,
    Math.max(MIN_BINS, targetBins),
  );
  const binSize = range / binCount;

  const buckets = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize;
    const end = index === binCount - 1 ? max : start + binSize;
    const count = values.filter(
      (value) =>
        value >= start &&
        (index === binCount - 1 ? value <= end : value < end),
    ).length;

    return {
      start,
      end,
      count,
      midpoint: start + binSize / 2,
    };
  });

  return buckets.map((bucket, index) => {
    const left = buckets[index - 1]?.count ?? bucket.count;
    const current = bucket.count;
    const right = buckets[index + 1]?.count ?? bucket.count;

    return {
      ...bucket,
      count: (left + current * 2 + right) / 4,
    };
  });
}

function DistributionTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className={styles['distribution-tooltip']}>
      <div className={styles['distribution-tooltip-label']}>
        {formatTime(label ?? point.midpoint)}
      </div>
      <div className={styles['distribution-tooltip-value']}>
        {Math.round(point.count)} runs
      </div>
      <div className={styles['distribution-tooltip-range']}>
        {formatTime(point.start)} - {formatTime(point.end)}
      </div>
    </div>
  );
}

function DistributionGraph({ seconds }: DistributionGraphProps) {
  const [binPresetIndex, setBinPresetIndex] = useState(1);
  const [range, setRange] = useState<RangeSelection | null>(null);

  const values = useMemo(() => {
    return seconds
      .filter((value): value is number => typeof value === 'number' && value > 0)
      .sort((left, right) => left - right);
  }, [seconds]);

  const overviewData = useMemo(() => {
    return buildDistribution(values, OVERVIEW_BINS, 1);
  }, [values]);

  useEffect(() => {
    if (!overviewData) {
      setRange(null);
      return;
    }

    setRange({
      startIndex: 0,
      endIndex: overviewData.length - 1,
    });
  }, [overviewData]);

  const selectedRange = range ?? {
    startIndex: 0,
    endIndex: overviewData?.length ? overviewData.length - 1 : 0,
  };

  const selectedStart = overviewData?.[selectedRange.startIndex]?.start ?? values[0];
  const selectedEnd =
    overviewData?.[selectedRange.endIndex]?.end ?? values[values.length - 1];

  const selectedValues = useMemo(() => {
    if (!values.length || selectedStart === undefined || selectedEnd === undefined) {
      return [];
    }

    return values.filter(
      (value) => value >= selectedStart && value <= selectedEnd,
    );
  }, [selectedEnd, selectedStart, values]);

  const mainData = useMemo(() => {
    return buildDistribution(selectedValues, BIN_PRESETS[binPresetIndex].bins, 1);
  }, [binPresetIndex, selectedValues]);

  if (!overviewData || !mainData) {
    return null;
  }

  const first = mainData[0];
  const last = mainData[mainData.length - 1];

  return (
    <section className={styles['distribution-panel']} aria-label="Time distribution">
      <div className={styles['distribution-header']}>
        <div>
          <span className={styles['distribution-title']}>Distribution</span>
          <span className={styles['distribution-meta']}>
            {seconds.length} runs · {BIN_PRESETS[binPresetIndex].label}
          </span>
        </div>
        <div
          className={styles['distribution-actions']}
          role="group"
          aria-label="Distribution interval"
        >
          {BIN_PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              type="button"
              className={
                index === binPresetIndex
                  ? styles['distribution-action-active']
                  : undefined
              }
              onClick={() => {
                setBinPresetIndex(index);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['distribution-chart']}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mainData}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="distribution-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--theme-color)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--theme-color)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="color-mix(in srgb, var(--theme-color) 12%, transparent)"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="midpoint"
              type="number"
              domain={[first.start, last.end]}
              ticks={[first.start, first.midpoint, last.midpoint, last.end]}
              tickFormatter={(value) => formatTime(Number(value))}
              stroke="var(--theme-color-hover)"
              tick={{ fill: 'var(--theme-color-hover)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--theme-color)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--theme-color-hover)"
              tick={{ fill: 'var(--theme-color-hover)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--theme-color)' }}
              tickLine={false}
              width={26}
            />
            <Tooltip
              cursor={{ stroke: 'var(--theme-color-hover)', strokeDasharray: '3 4' }}
              content={<DistributionTooltip />}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--theme-color)"
              strokeWidth={2.5}
              fill="url(#distribution-fill)"
              dot={false}
              activeDot={{ r: 3, fill: 'var(--theme-color)' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles['distribution-zoom']}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={overviewData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="color-mix(in srgb, var(--theme-color) 10%, transparent)"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="midpoint"
              type="number"
              domain={[overviewData[0].start, overviewData[overviewData.length - 1].end]}
              tickFormatter={(value) => formatTime(Number(value))}
              stroke="var(--theme-color-hover)"
              tick={{ fill: 'var(--theme-color-hover)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--theme-color)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="count"
              stroke="color-mix(in srgb, var(--theme-color) 70%, transparent)"
              strokeWidth={1.5}
              fill="color-mix(in srgb, var(--theme-color) 8%, transparent)"
              dot={false}
              isAnimationActive={false}
            />
            <Brush
              dataKey="midpoint"
              startIndex={selectedRange.startIndex}
              endIndex={selectedRange.endIndex}
              onChange={({ startIndex, endIndex }) => {
                if (
                  typeof startIndex !== 'number' ||
                  typeof endIndex !== 'number'
                ) {
                  return;
                }

                setRange({
                  startIndex,
                  endIndex,
                });
              }}
              travellerWidth={8}
              height={24}
              stroke="var(--theme-color-hover)"
              fill="color-mix(in srgb, var(--theme-color) 5%, transparent)"
              tickFormatter={(value) => formatTime(Number(value))}
              alwaysShowText={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles['distribution-labels']}>
        <span>{formatTime(first.start)}</span>
        <span>{formatTime(last.end)}</span>
      </div>
    </section>
  );
}

export default DistributionGraph;
