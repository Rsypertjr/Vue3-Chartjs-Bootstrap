<template>
  <div class="container-fluid">
    <h1 class="mb-2">{{ activeData.title }}</h1>
    <hr/>
    <ResolutionSelect @select-resolution="handleResolution"/>
    <h1 class="mb-2" v-if="activeData.type == 'pie'">
        Date: {{ activeData.pie_headers[dateIdx] }}
    </h1>
    <canvas id="chart"></canvas>     
    <ChartPager :rows="rows" :isClosed="isClosed" :type="type" :resolution="resolution" @update-page="handleUpdatePage"/>  
  </div>
</template>

<script>
  /* eslint-disable */
  import { tSNonNullExpression } from '@babel/types';
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables);
  import { onMounted, onUpdated, onUnmounted, onBeforeMount,  ref, watchEffect, watch  } from 'vue'
  import ChartPager from './ChartPager.vue'
  import ResolutionSelect from './ResolutionSelect.vue';

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
    ChartPager,
    ResolutionSelect
},    
     
      setup(props,context){
        let pNum = ref(1)
        const idx = ref(props.selectedindex)
        const acData = ref(props.activeData)
        const acDataStore = ref({})
        const resolution = ref("1");
        let type = ref('');
        let dateIdx = ref(0);

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
              let ctx = document.getElementById('chart')
              theChart = new Chart(ctx, props.activeData)
        })

        onUnmounted(() => {
          console.log("Component is unmounting....")
          theChart.destroy() 
         
        })

        onUpdated(() => {   

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
           if(props.activeData.type == "pie") {
              let plen = props.activeData.pie_headers.length;
              console.log("Page Length: ",plen)
              dateIdx.value = pNum.value % plen;
              if(dateIdx.value == 0)
                dateIdx.value = plen-1;
              }
              
        });
         
        // methods
        function handleUpdatePage(pageNo){
            pNum.value = pageNo
            console.log("page no: ", pNum.value)
            context.emit("updatePageTop",pageNo)
            idx.value = props.selectedindex
            //console.log("Props Data", props.activeData)
          }

          function handleResolution(res){
            resolution.value = res;
            context.emit("sendResolution",res);

          }

        return {
            handleUpdatePage,
            handleResolution,
            idx,
            pdata,
            acData,
            acDataStore,
            type,
            resolution,
            pNum,
            dateIdx
          }

      },
  };
</script>