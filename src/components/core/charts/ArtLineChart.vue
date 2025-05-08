<template>
  <div ref="chartRef" class="line-chart" :style="{ height: props.height }"></div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts'
  import type { EChartsOption } from 'echarts'
  import { getCssVariable, hexToRgba } from '@/utils/colors'
  import { useChart, useChartOps } from '@/composables/useChart'
  const {
    chartRef,
    initChart,
    isDark,
    getAxisLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getSplitLineStyle
  } = useChart()

  interface Props {
    data: number[][]; // 修改为二维数组
    xAxisData?: string[]
    height?: string
    colors?: string[]; // 支持每条线不同颜色
    lineWidth?: number
    showAreaColor?: boolean
    showAxisLabel?: boolean
    showAxisLine?: boolean
    showSplitLine?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    height: useChartOps().chartHeight,
    data: () => [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]], // 默认三条线数据
    xAxisData: () => [],
    colors: () => [], // 默认颜色数组
    lineWidth: 3,
    showAreaColor: false,
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true
  })

  const options: () => EChartsOption = () => {
    const computedColors = props.colors.length > 0 ? props.colors : [useChartOps().themeColor, useChartOps().themeColor, useChartOps().themeColor];

    return {
      animation: false,
      grid: {
        top: 15,
        right: 15,
        bottom: 0,
        left: 0,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.xAxisData,
        axisTick: getAxisTickStyle(),
        axisLine: getAxisLineStyle(props.showAxisLine),
        axisLabel: getAxisLabelStyle(props.showAxisLabel)
      },
      yAxis: {
        axisLabel: getAxisLabelStyle(props.showAxisLabel),
        axisLine: getAxisLineStyle(props.showAxisLine),
        splitLine: getSplitLineStyle(props.showSplitLine)
      },
      series: props.data.map((lineData, index) => ({
        data: lineData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: props.lineWidth,
          color: computedColors[index]
        },
        areaStyle: props.showAreaColor
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: computedColors[index]
                    ? hexToRgba(computedColors[index], 0.2).rgba
                    : hexToRgba(getCssVariable('--el-color-primary'), 0.2).rgba
                },
                {
                  offset: 1,
                  color: computedColors[index]
                    ? hexToRgba(computedColors[index], 0.01).rgba
                    : hexToRgba(getCssVariable('--el-color-primary'), 0.01).rgba
                }
              ])
            }
          : undefined
      }))
    }
  }

  watch(isDark, () => {
    return initChart(options())
  })

  // 监听 props.data 的变化
  watch(() => props.data, () => {
    return initChart(options())
  }, { deep: true })

  onMounted(() => {
    return initChart(options())
  })
</script>

<style lang="scss" scoped>
  .line-chart {
    width: calc(100% + 10px);
  }
</style>    