<template>
    <div>
      <canvas id="planet-chart"></canvas>
    </div>
</template>
  
<script>
    import { Chart, registerables } from 'chart.js'
    Chart.register(...registerables);
    import planetChartData from '../planet-data.js'
    export default {
        name: 'PlanetChart',
        data() {
            return {
                planetChartData: planetChartData
                }
            },
        mounted() {
            const ctx = document.getElementById('planet-chart')
            console.log("Planet Data: ",this.planetChartData)
            new Chart(ctx, this.planetChartData);
        }
    }
</script>