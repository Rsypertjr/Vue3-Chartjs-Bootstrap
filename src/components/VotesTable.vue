<template>
    <div class="container-fluid mb-5" >
        <table v-if="pages.length > 0" class="table">
            <thead>
                <tr>
                    <th scope="col" v-for="header in headers" :key="header">{{ header }}</th>          
                </tr>
            </thead>
            <thead></thead>
            <tbody>
                <tr v-for = "row in pageArray" :key="row">  
                    <td v-for="cell in row" :key="cell">
                        {{cell}}
                        
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="row d-flex justify-content-center">
            <div class="d-flex justify-content-center">
                <button type="button" @click="previous" class="btn btn-light pager-btn">Previous</button>   
                <div  v-for="pg in pageArray.keys()"  :key="pg"  class="pager-btn"  >
                    <button  v-if="((pg + 1) + pageIndex) <= pages.length" :id="'page-'+(pg+1+pageIndex)" class='btn btn-light' @click="showPage((pg + 1) + pageIndex)">
                        {{ (pg + 1) + pageIndex }}
                    </button>
                </div>
                <button type="button" @click="next" class="btn btn-light pager-btn">Next</button>
            </div>      
        </div>
    

    </div>
    
</template>
<script>
    import { ref, computed, watchEffect, onMounted, onUpdated } from 'vue'
    import $ from 'jquery'

    export default{
        props: {
            rows: Array,
            headers: Array
        },

        setup(props){
            let pageSize = ref(10);
            let currentPage = ref(1);
            let pageArrayIndex = ref(0);
            let showPager = ref(true);

            onMounted(() => {
                hlitePage(1)
            })

            onUpdated(()=> {
                console.log("Current Page: ", currentPage.value)  
                hlitePage(currentPage.value)
            })
           

            console.log("Prop rows: ",props.rows);
            const pages = computed(() => {
                let page_s = [];
                let idx = 0;
              
                for(let i = 0;i < props.rows.length;i += pageSize.value){
                    let sl = pageSize.value;
                    if((props.rows.length - i) < 10)
                        sl = props.rows.length - i
                    page_s[idx] = props.rows.slice(i,i+sl);
                    page_s[idx] = page_s[idx].filter((p) => p.index != 'undefined')
                    idx++;
                }
                return page_s;
            });
            console.log("Pages: ",pages.value)
            const pageArray = computed(() => {
                
                return pages.value[currentPage.value-1];
                
            });

            const pageIndex = computed(() => {
                let idx = pageArrayIndex.value;
                console.log("Page Index", idx)
                return idx;

            });

             
            //methods
            function showPage(num){
                currentPage.value = num;
            }

            function next(){
               
                if(currentPage.value < pages.value.length){ 
                    currentPage.value++                  
                    let chk = (currentPage.value-1) % 10 == 0;
                    console.log("Check: ",chk)
                    if(chk){
                        pageArrayIndex.value += 10  
                        //currentPage.value++                   
                    }                    
                }
                else if(currentPage.value > pages.value.length) {
                   console.log("end condition...")
                   //currentPage.value = pages.value.length - 1;
                }
                
            }

            function previous(){
                currentPage.value--
                if(currentPage.value >= 1){   
                    let chk = currentPage.value % 10 == 0;
                    console.log("Check: ",chk)
                    if(chk){
                        pageArrayIndex.value -= 10                        
                    }
                }
                else{
                    pageArrayIndex.value = 0;
                    currentPage.value = 1;
                }
                
            }

            function hlitePage(num){
                $('[id^="page-"]').not('[id="page-' + num + '"]').css('background-color','#f8f9fa')
                $('[id="page-' + num + '"]').css('background-color','lightgrey')
            }
            
            watchEffect(() => {
                
                    if(typeof(pages.value[currentPage.value-1]) == "undefined"){
                        console.log("correcting...")
                        currentPage.value = 1;
                        pageArrayIndex.value = 0;
                    }
                    
                    hlitePage(currentPage.value)
            });

            return {
                pageSize,
                currentPage,
                pageArrayIndex,
                pages,
                pageArray,
                pageIndex,
                showPager,
                showPage,
                hlitePage,
                next,
                previous
            }
        },
    };
</script>
<style>
    .table {
        zoom: 75%;
    }
    .pager-btn{
        position:relative;
        float:left;
    }
   
</style>