"use client";

interface ChartDataPoint {
  month: string | Date;
  value: number;
  label?: string;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  label: string;
  valueFormatter?: (value: number) => string;
  color?: string;
}

export default function SimpleLineChart({
  data,
  label,
  valueFormatter = (v) => v.toFixed(0),
  color = "hsl(var(--primary))",
}: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Convert month strings/dates to Date objects and sort
  const sortedData = [...data]
    .map((d) => {
      let monthDate: Date;
      if (d.month instanceof Date) {
        monthDate = d.month;
      } else if (typeof d.month === "string") {
        monthDate = new Date(d.month);
        // Validate date
        if (isNaN(monthDate.getTime())) {
          console.warn("Invalid date:", d.month);
          monthDate = new Date(); // Fallback to current date
        }
      } else {
        console.warn("Invalid month format:", d.month);
        monthDate = new Date(); // Fallback to current date
      }
      
      return {
        ...d,
        month: monthDate,
        value: typeof d.value === "number" ? d.value : parseFloat(String(d.value)) || 0,
      };
    })
    .filter((d) => !isNaN(d.month.getTime())) // Filter out invalid dates
    .sort((a, b) => a.month.getTime() - b.month.getTime());

  // Calculate chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get min/max values for scaling
  const values = sortedData.map((d) => d.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values, 1); // Ensure at least 1 for visibility

  // Scale function
  const scaleX = (date: Date) => {
    if (sortedData.length === 1) return padding.left + chartWidth / 2;
    const timeRange =
      sortedData[sortedData.length - 1].month.getTime() -
      sortedData[0].month.getTime();
    const timeOffset = date.getTime() - sortedData[0].month.getTime();
    return padding.left + (timeOffset / timeRange) * chartWidth;
  };

  const scaleY = (value: number) => {
    if (maxValue === minValue) return padding.top + chartHeight / 2;
    const valueRange = maxValue - minValue;
    const valueOffset = value - minValue;
    return (
      padding.top + chartHeight - (valueOffset / valueRange) * chartHeight
    );
  };

  // Generate path for line
  const points = sortedData.map((d) => ({
    x: scaleX(d.month),
    y: scaleY(d.value),
    value: d.value,
    month: d.month,
  }));

  // Create line path
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  // Format month for display
  const formatMonth = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }
    try {
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch (e) {
      return date.toString();
    }
  };

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartHeight * (1 - t);
          const value = minValue + (maxValue - minValue) * t;
          return (
            <g key={t}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {valueFormatter(value)}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
            />
            {/* Tooltip on hover */}
            <title>
              {formatMonth(point.month)}: {valueFormatter(point.value)}
            </title>
          </g>
        ))}

        {/* X-axis labels */}
        {sortedData.map((d, index) => {
          // Show every month or every other month if many
          const showLabel =
            sortedData.length <= 6 ||
            index % Math.ceil(sortedData.length / 6) === 0 ||
            index === sortedData.length - 1;
          if (!showLabel) return null;

          const x = scaleX(d.month);
          return (
            <text
              key={index}
              x={x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              fillOpacity={0.6}
            >
              {formatMonth(d.month)}
            </text>
          );
        })}

        {/* Axis lines */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

