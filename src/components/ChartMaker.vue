<template>
  <div>
    <canvas id="chart"></canvas>     
    <ChartPager :rows="rows" :isClosed="isClosed" @update-page="handleUpdatePage"/>  
  </div>
</template>

<script>
  /* eslint-disable */
  import { tSNonNullExpression } from '@babel/types';
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables);
  import { onMounted, onUpdated,  ref, watchEffect  } from 'vue'
  import ChartPager from './ChartPager.vue'
 
  let ctx = null
  let theChart = null
  export default {
      name: 'VotesLineChart',
      props: {
        activeData: Object,
        isClosed: Boolean,
        selectedindex: Number,
        rows: Array,
        theChart: Object
      }, 
      components:{
        ChartPager
      },    
     
      setup(props,context){
        let pNum = ref(0)
       
        onMounted(() => {            
              theChart = null;
              ctx = document.getElementById('chart')
              console.log("Active Data in Mounted",props.activeData)
              console.log("selected index",props.selectedindex)
              let pdata = {}
              pdata.type = props.activeData.type
              pdata.options = props.activeData.options
              pdata.data = props.activeData.data
              pdata.data.labels = props.activeData.data.labels[props.selectedindex]
              //pdata.data.datasets[0].data = props.activeData.data.datasets[0].data[props.selectedindex]
              //pdata.data.datasets[1].data = props.activeData.data.datasets[1].data[props.selectedindex]
              //pdata.data.datasets[2].data = props.activeData.data.datasets[2].data[props.selectedindex]
              props.activeData.data.datasets.forEach((dataset, index) => {
                pdata.data.datasets[index].data = dataset.data[props.selectedindex]
              });
              console.log("PDATA",pdata)
              theChart = new Chart(ctx, pdata); 
           
        })

        onUpdated(() => {   
          console.log("OnUpdated")  
          theChart.type = props.activeData.type
          theChart.options = props.activeData.options
          theChart.data = props.activeData.data
          theChart.data.labels = props.activeData.data.labels[props.selectedindex]
          //theChart.data.datasets[0].data = props.activeData.data.datasets[0].data[props.selectedindex]
          //theChart.data.datasets[1].data = props.activeData.data.datasets[1].data[props.selectedindex]
          //theChart.data.datasets[2].data = props.activeData.data.datasets[2].data[props.selectedindex]
          props.activeData.data.datasets.forEach((dataset, index) => {
            theChart.data.datasets[index].data = dataset.data[props.selectedindex]
            });

          if(!props.isClosed)
            theChart.update()
          console.log("Updated theChart",theChart.type)
         
        }),

       

        watchEffect(() => {
          console.log("page no from pager", pNum.value)
          if(props.isClosed){
            
          }
         

        });
         
        // methods
        function handleUpdatePage(pageNo){
            pNum.value = pageNo
            console.log("page no: ", pNum.value)
            context.emit("updatePageTop",pageNo)
        
          }

        return {
            handleUpdatePage
          }

      },
  };
</script>