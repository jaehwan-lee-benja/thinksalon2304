<template>
  <Pie :chart-options="chartOptions" :chart-data="getChartData" :chart-id="chartId" :dataset-id-key="datasetIdKey"
    :plugins="plugins" :css-classes="cssClasses" :styles="styles" :width="width" :height="height" />
</template>
  
<script>
import { Pie } from 'vue-chartjs'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

export default {
  name: 'PieChart',
  components: {
    Pie
  },
  props: {
    expenses: {
      type: Array,
      default: () => []
    },
    chartId: {
      type: String,
      default: 'pie-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 250
    },
    height: {
      type: Number,
      default: 250
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => { }
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    getPastAmount() {
      const getAmount = this.expenses.find(e => e.category === "past")?.amount || ""
      let numberedAmount = getAmount;
      if (isNaN(getAmount)) {
        numberedAmount = Number(getAmount.replace(/,/g, ""))
      }
      return numberedAmount
    },
    getPresentAmount() {
      const getAmount = this.expenses.find(e => e.category === "present")?.amount || ""
      let numberedAmount = getAmount;
      if (isNaN(getAmount)) {
        numberedAmount = Number(getAmount.replace(/,/g, ""))
      }
      return numberedAmount
    },
    getFutureAmount() {
      const getAmount = this.expenses.find(e => e.category === "future")?.amount || ""
      let numberedAmount = getAmount;
      if (isNaN(getAmount)) {
        numberedAmount = Number(getAmount.replace(/,/g, ""))
      }
      return numberedAmount
    },
    getChartData() {
      const chartData = {
        labels: ['과거형 지출', '현재형 지출', '미래형 지출'],
        datasets: [
          {
            backgroundColor: ['#c68036', '#6fa468', '#5eaab4'],
            data: [this.getPastAmount, this.getPresentAmount, this.getFutureAmount]
          }
        ]
      }
      return chartData
    }
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
</script>
  