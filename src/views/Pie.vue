<template>
  <!-- <p>과거형 결정값(3): {{ getPastAmount2() }}</p> -->
  <Pie :chart-options="chartOptions" :chart-data="chartData" :chart-id="chartId" :dataset-id-key="datasetIdKey"
    :plugins="plugins" :css-classes="cssClasses" :styles="styles" :width="width" :height="height" />
</template>
  
<script>
import { Pie } from 'vue-chartjs'
// import { customData } from './ReadingView.vue'; // ReadingView.vue에서 값을 가져옵니다.
// import myMixin from './ReadingView.vue';

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
  // mixins: [myMixin],
  name: 'PieChart',
  components: {
    Pie
  },
  mounted() {
    console.log("props = ", this.props);
    console.log("expenses = ", this.expenses);
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
      default: 400
    },
    height: {
      type: Number,
      default: 400
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
      return Number(getAmount.replace(/,/g, ""))
    },
    getPresentAmount() {
      const getAmount = this.expenses.find(e => e.category === "present")?.amount || ""
      return Number(getAmount.replace(/,/g, ""))
    },
    getFutureAmount() {
      const getAmount = this.expenses.find(e => e.category === "future")?.amount || ""
      return Number(getAmount.replace(/,/g, ""))
    },
    getChartData() {
      const chartData = {
        labels: ['과거형 지출', '현재형 지출', '미래형 지출'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
            data: [this.getPastAmount, this.getPresentAmount, this.getFutureAmount]
          }
        ]
      }
      console.log("chartData = ", chartData);
      return chartData
    }
  },
  data() {
    return {
      chartData: {
        labels: ['과거형 지출', '현재형 지출', '미래형 지출'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
            data: [100, 200, 300]
            // data: [getPastAmount3()]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
</script>
  