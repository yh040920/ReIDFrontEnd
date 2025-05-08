<template>
  <div ref="chartRef" class="ring-chart" :style="{ height: props.height }"></div>
</template>

<script setup lang="ts">
  import type { EChartsOption } from 'echarts'
  import { useChart, useChartOps } from '@/composables/useChart'
  const { chartRef, initChart, isDark } = useChart()

  interface Props {
    data?: Array<{ value: number; name: string }>
    height?: string
    color?: string[]
    radius?: string[]
    showLabel?: boolean
    borderRadius?: number
    centerText?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => [
      { value: 35, name: '分类1' },
      { value: 25, name: '分类2' },
      { value: 20, name: '分类3' },
      { value: 20, name: '分类4' }
    ],
    height: useChartOps().chartHeight,
    color: () => [],
    radius: () => ['50%', '80%'],
    showLabel: true,
    borderRadius: 10,
    centerText: ''
  })

  const options: () => EChartsOption = () => {
    const opt: EChartsOption = {
        legend: {
        show: true, // 确保图例显示
        orient: 'vertical', // 水平排列
        left: 'right', // 靠右显示（也可以是 'left' 或 'center'）
        top: 'left', // 顶部显示
        textStyle: {
          color: isDark.value ? '#fff' : '#333' // 根据主题设置文字颜色
        },
        data: props.data.map(item => item.name) // 图例数据来自 props.data 的 name
      },
      series: [
        {
          name: '数据占比',
          type: 'pie',
          radius: props.radius,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: props.borderRadius
          },
          label: {
            show: props.showLabel,
            formatter: '{b}\n{c}', // 显示名称 + 数值
            position: 'outside',
            color: '#999', // 适配主题
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 25,
            smooth: true
          },
          data: props.data,
          color: props.color
        }
      ]
    }

    if (props.centerText) {
      opt.title = {
        text: props.centerText,
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 500,
          color: '#ADB0BC'
        }
      }
    }

    return opt
  }

  watch(isDark, () => {
    return initChart(options())
  })

  onMounted(() => {
    return initChart(options())
  })
</script>
