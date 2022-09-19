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
          ctx = document.getElementById('votes-line-chart')
          if(theChart != null){
            let temp = theChart
            theChart.destroy()
            theChart = temp
          }
          else
            ctx = document.getElementById('votes-line-chart')
            theChart = new Chart(ctx, props.activeData);
        })
   
        // method
        function handleUpdatePage(pageNo){
            //alert(pageNo)
            context.emit("updatePageTop",pageNo)
          }

        return {
            handleUpdatePage
          }

      },
  };
</script>