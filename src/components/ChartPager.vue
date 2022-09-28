<template>
    <div class="row d-flex justify-content-center" :class="{'bar-chart': isPie }">
            <div class="d-flex justify-content-center">
                <button type="button" @click="previous" class="btn btn-light pager-btn">Previous</button>   
                <div  v-for="pg in pageArray.keys()"  :key="pg"  class="pager-btn"  >
                    <button v-if="((pg + pageIndex) <= pages.length)" :id="'page-'+(pg+pageIndex)" class='btn btn-light' @click="showPage(pg + pageIndex)">
                         {{ pg  + pageIndex }}
                    </button>
                </div>
                <button type="button" @click="next" class="btn btn-light pager-btn">Next</button>
            </div>      
        </div>
</template>


<script>
    import { ref, onMounted, onUpdated, computed, watchEffect } from 'vue'
    import $ from 'jquery'
    export default {

        props: {
            rows: Array,
            isClosed: Boolean,
            type: String,
            resolution: String

        },

        setup(props,context){
            let pageSize = ref(10);
            let currentPage = ref(1);
            let pageArrayIndex = ref(1);
            let showPager = ref(true);
            let isPie = ref(true);  

           

            onMounted(() => {
                console.log("type in Pager: ", props.type)
                hlitePage(1)
                currentPage.value = 1
                pageArrayIndex.value = 1
                isPie.value = props.type == 'pie'
            })

            onUpdated(()=> {
                console.log("Current Page: ", currentPage.value)  
                hlitePage(currentPage.value)
               
            })
           

           
            const pages = computed(() => {
                let page_s = [];
                let idx = 0;
                
                

                for(let i = 0;i < props.rows.length;i += pageSize.value*parseInt(props.resolution)){
                    let sl = pageSize.value;
                    if((props.rows.length - i) < pageSize.value)
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
                if( typeof(props.rows[parseInt(num)]) != "undefined" ){
                    currentPage.value = num;
                    context.emit("updatePage",currentPage.value) 
                }
                else{
                    currentPage.value = 1;
                    context.emit("updatePage",currentPage.value); 
                }
                   
                
            }

            function next(){
               
                if(currentPage.value < pages.value.length){ 
                    currentPage.value++
                                     
                    
                    if(currentPage.value <= pages.value.length) {
                        let chk = (currentPage.value-1) % 10 == 0;
                        console.log("Check: ",chk);
                        if(chk){
                            pageArrayIndex.value += 10  
                            //currentPage.value++                   
                        }    
                        context.emit("updatePage",currentPage.value);         
                    }     
                    else
                        currentPage.value--; 
                         
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
                        if(pageArrayIndex.value <= 0)   
                            pageArrayIndex.value = 1;                  
                    }
                    context.emit("updatePage",currentPage.value)
                }
                else{
                    pageArrayIndex.value = 1;
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
                        pageArrayIndex.value = 1;
                    }
                    if(props.isClosed == true){
                        pageArrayIndex.value = 1;
                        currentPage.value = 1;
                    }

                    if(props.rows.length < 10)
                        pageSize.value = props.rows.length;
                    
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
                previous,
                isPie
            }
        },

    };
</script>
<style>
    .bar-chart{
       transform: scale(1.5);
       margin-bottom: 1em;
    }
</style>