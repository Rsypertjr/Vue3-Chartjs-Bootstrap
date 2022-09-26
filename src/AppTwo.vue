<template>
    <div style="height:300px;">
      <bar-chart :styles="myStyles" :chart-data="dataCollection"
        :chart-options="chartOptions"></bar-chart>
    </div>
</template>
  
  <script>
  import BarChart from './components/ChartBar.vue';
  
  export default {
    
    name: 'App',
    components: {
      BarChart,
    },
    props: ['dataCollection'],
    data() {
      return {
        myStyles: {
          height: '300px',
          width: '100%',
          position: 'relative',
        },
        chartOptions: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            }],
            xAxes: [{
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: false,
              },
            }],
          },
          legend: {
            display: true,
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label(tooltipItems, data) {
                const { datasetIndex, index } = tooltipItems;
                const value = data.datasets[datasetIndex].data[index];
                if (parseInt(value, 10) > 999) {
                  return ` ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                }
                return ` ${value}`;
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          height: 300,
        },
      };
    },
  };
  </script>