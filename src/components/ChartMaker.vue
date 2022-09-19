<template>
  <div>
    <canvas id="votes-line-chart"></canvas>     
    <ChartPager :rows="activeData.rows" :isClosed="isClosed" @update-page="handleUpdatePage"/>  
  </div>
</template>

<script>
  /* eslint-disable */
  import { tSNonNullExpression } from '@babel/types';
import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables);
  import { onMounted, onUpdated  } from 'vue'
  import ChartPager from './ChartPager.vue'
  
  let ctx = ''
  let theChart = ''
  export default {
      name: 'VotesLineChart',
      props: {
        activeData: {},
        isClosed: Boolean
      }, 
      components:{
        ChartPager
      },    
     
      setup(props,context){
        onMounted(() => {            
            ctx = document.getElementById('votes-line-chart')
            theChart = new Chart(ctx, props.activeData);
        })

        onUpdated(() => {     
          theChart.data.labels = props.activeData.data.labels
          theChart.data.datasets[0] = props.activeData.data.datasets[0]
          theChart.data.datasets[1] = props.activeData.data.datasets[1]
          theChart.data.datasets[2] = props.activeData.data.datasets[2]
          theChart.update()
          console.log("Updated theChart",theChart)
        })
   
        // methods
        function handleUpdatePage(pageNo){
            context.emit("updatePageTop",pageNo)
          }

        return {
            handleUpdatePage
          }

      },
  };
</script>