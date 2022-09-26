<template>
  <div>
    <h1 class="mb-2">{{ activeData.title }}</h1>
    <hr/>
    <canvas id="chart"></canvas>     
    <ChartPager :rows="rows" :isClosed="isClosed" :type="type" @update-page="handleUpdatePage"/>  
  </div>
</template>

<script>
  /* eslint-disable */
  import { tSNonNullExpression } from '@babel/types';
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables);
  import { onMounted, onUpdated, onUnmounted, onBeforeMount,  ref, watchEffect, watch  } from 'vue'
  import ChartPager from './ChartPager.vue'
  var ctx = null
  var theChart = null
  var theChart2 = null
  var pdata = {}
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
        const idx = ref(props.selectedindex)
        const acData = ref(props.activeData)
        const acDataStore = ref({})
        let type = ref('')

        /*

        watch(idx, (currentValue, oldValue) => {
          console.log("new index: ",currentValue);
          console.log("old index: ", oldValue);
          acData.value = props.activeData
        });


        watch(acData, (currentValue, oldValue) => {
          console.log("new active data: ",currentValue);
          console.log("old active data: ", oldValue);
        });

        */
        onBeforeMount(() => {
          type.value = props.activeData.type
        })

        onMounted(() => {     
              
             
              console.log("Active Data in Mounted",props.activeData)
              //console.log("selected index",props.selectedindex)
             // console.log("the Chart in Mounted", theChart)
                //if(props.activeData.type == 'bar')
                  // Chart.defaults.font.size = 25;
                let ctx = document.getElementById('chart')
                theChart = new Chart(ctx, props.activeData)
              
             
        })

        onUnmounted(() => {
          console.log("Component is unmounting....")
          //console.log("Chart in Unmount",theChart)
          theChart.destroy() 
         
        })

        onUpdated(() => {   

        
            //console.log("OnUpdated")   
            //console.log("Props in Updated: ", props.activeData)
            //console.log("theChart in Updated: ",theChart)
            //theChart.data.labels = '';
            //theChart.type = '';
            theChart.data.datasets.forEach((dataset) => {
                dataset.data = {};
            });
            theChart.type = props.activeData.type
            theChart.options = props.activeData.options
            theChart.data = props.activeData.data
            theChart.data.labels = Object.values(props.activeData.data.labels)
            props.activeData.data.datasets.forEach((dataset) => {
              theChart.data.datasets.data = dataset.data
            });
            
            theChart.update()
            
        }),

       

        watchEffect(() => {
          //console.log("page no from pager", pNum.value)
         
         
         

        });

        function updateData(sindex,paData){
          let pdata = {}
          pdata.type = paData.type
              pdata.options = paData.options
              pdata.data = paData.data
              pdata.data.labels = paData.data.labels[sindex]
              paData.data.datasets.forEach((dataset,index) => {
                  pdata.data.datasets[index] = dataset
                  pdata.data.datasets[index].data = dataset.data[sindex];
              })
            return pdata
            
        }
         
        // methods
        function handleUpdatePage(pageNo){
            pNum.value = pageNo
            //console.log("page no: ", pNum.value)
            context.emit("updatePageTop",pageNo)
            idx.value = props.selectedindex
            //console.log("Props Data", props.activeData)
           

           
          }

        return {
            handleUpdatePage,
            updateData,
            idx,
            pdata,
            acData,
            acDataStore,
            type
          }

      },
  };
</script>