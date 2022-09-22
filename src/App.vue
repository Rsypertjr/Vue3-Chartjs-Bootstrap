<template>
    
    <div id = "results_table" class="container">
        <div id="tophdr" class="container-fluid m-2">
            <div class=" d-flex justify-content-center input-group m-2">
                <div class="input-group-prepend">
                    <label class="input-group-text" for="inputGroupSelect01">Choose State</label>
                </div>
                <select v-model="state" class="custom-select" id="inputGroupSelect01">
                    <option v-for="st in states" :key="st">{{ st }}</option>
                </select>
        
                <div class="input-group-prepend">
                    <label class="input-group-text" for="inputGroupSelect01">Sort By</label>
                </div>
                <!--select v-model="sort_selected" class="custom-select" id="inputGroupSelect01">
                    <option v-for="sort in sorts" :key="sort">{{ sort }}</option>
                </select-->
            </div>    
            <div class="jumbotron" >
                <h1>2020 Presidential Election Parser</h1> 
                <h2>Race Data:</h2>  
                <p>{{ race_info.race_id }}</p>
                <p>{{ race_info.race_slug }}</p>
                <p>{{ race_info.url }}</p>          
            </div>
        </div>	
        <div v-if="!( vote_rows.length > 0)" class="loader"></div> 
        <div v-else class="container">  
            <div class="mb-5">        
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark p-2">
                    <a class="navbar-brand" href="#">Navbar</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav">
                            <li class="nav-item active">
                                <span @click="votestable" class="nav-link">VotesTable</span>
                            </li>
                            <li class="nav-item">
                                <span @click="voteslinechart" class="nav-link align-middle">Votes<br/>Line Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="votesspikeschart" class="nav-link  align-middle">Spikes<br/>Line Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="votesgainloss" class="nav-link  align-middle">Difference<br/>Line Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="perlinechart" class="nav-link  align-middle">% Remaining Votes<br/>Line Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="totalvotespiechart" class="nav-link  align-middle">Votes<br/>Pie Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="stackedbarchart" class="nav-link  align-middle">Votes<br/>Stacked Bar Chart</span>
                            </li>
                            <li class="nav-item">
                                <span @click="votesbarchart" class="nav-link  align-middle">Votes<br/>Bar Chart</span>
                            </li>
                            <!--li class="nav-item">
                                <a class="nav-link" href="#/pricing">Pricing</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link disabled" href="#">Disabled</a>
                            </li-->
                        </ul>
                    </div>
                </nav>
            </div>
            <!-- Dynamic Component Selection ---->
            <div id="dyn_component" class="container-fluid">
                <div class="row d-flex justify-content-start p-4" :class="{'bClose' : this.activeData.type == 'pie'}">
                    <button type="button" @click="close" class="btn btn-dark pager-btn">Close</button> 
                </div>
               
                <div v-if="isClosed == true" class="loader"></div> 
                <div v-else class="row d-flex justify-content-center">                    
                    <component  :is="activeComponent" :activeData="activeData" :rows="vote_rows" 
                    :isClosed="isClosed" :selectedindex="selectedindex" @update-page-top="handleUpdatePageTop"></component> 
                </div>  
                       
            </div>
           
        </div>
    </div>
</template>

<script>
 /* eslint-disable */   
import $ from "jquery";
import 'datatables.net-dt';
import VotesTable from './components/VotesTable.vue'
import ChartMaker from './components/ChartMaker.vue'
import CloseComponent from './components/CloseComponent.vue'
//import PlanetChart from './components/PlanetChart.vue'

export default {
  
  name: 'App',
  components: {
    VotesTable,
    ChartMaker,
    CloseComponent
    
  
  },
  data() {
    return {
            test: "This is a Test",
            headers : ["Index","Biden %","Biden Votes","Trump %","Trump Votes","Other Votes","Time Stamps","Votes", "Votes Added","Trump Added","Biden Added","% of Remaining Biden","% of Remaining Trump"],
            tlheaders: ["Biden Votes","Biden Vote Increase","1st Index","2nd Index", "Other Votes","Time1","Time2","1st Trump Votes","2nd Trump Votes",
                        "Trump Vote Loss","Accumulated Trump Vote Loss","Votes Increase + Trump Loss","Last Vote Total", "Overall Vote Increase"],

            blheaders: ["Trump Votes","Trump Vote Increase","1st Index","2nd Index", "Other Votes","1st Biden Votes","2nd Biden Votes",
                        "Biden Vote Loss","Accumulated Biden Vote Loss","Votes Increase + Biden Loss","Last Vote Total", "Overall Vote Increase"],     
            states: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
                        "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota",
                        "Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
                        "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee",
                        "Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],    
            state: 'Michigan',
            sorts: ["Time Stamps","Cumulative Vote Totals"],  
            row: '',
            header: '',
            cell:'',
            itr: '',
            timeseries: {},
            vote_rows: [],
            race_info: {},
            selectedindex: 1,
            trump_votes_decrease: [],
            biden_votes_decrease: [],
            total_biden_increase: 0,
            trump_voteloss: 0,
            biden_voteloss: 0,
            date_headers: [],
            datedata_biden: [],
            datedata_trump: [],
            datedata_biden_add: [],
            datedata_trump_add: [],
            datedata_biden_diff_add: [],
            datedata_trump_diff_add: [], 
            datedata_other: [],
            datedata_other_add: [],
            datedata_total_add: [],
            bin_headers: [],
            bin_trump: [],
            bin_biden: [],
            biden_slices: [],
            trump_slices: [],
            other_slices: [],
            total_slices: [],
            dateheaders_store: [],
            datedatabiden_store: [],
            datedatabidenadd_store: [],
            datedatabidenadddiff_store: [],
            datedatatrump_store: [],
            datedatatrumpadd_store: [],
            datedatatrumpadddiff_store: [],
            datedataother_store: [],
            datedataotheradd_store: [],
            datedatatotaladd_store: [],
            datedatatotal_store: [],
            perremainingtrump_store: [],
            perremainingbiden_store:[],
            parse_interval: 10,
            pie_headers: [],
            the_pieheader:null,
            the_stackedheader:null,
            //sort_selected:'Time Stamps',
            // sort: "Time Stamps",
            selected:'1 Times',
            ttable:'',                           
            vote_bins: [],
            number_pages: 0,
            pageSize: 10,
            step: 0,
            table:'',
            activeComponent:'',
            chartType:'',
            activeData: [],
            showChart: false,
            zoomC: '0.9',
            mTop:'-15em',
            fSize:'1em',
            isClosed: true,
            theChart:null
        }
      },
  watch:{
    
      selectedindex: function(val){
          console.log("Selected Index changed: ", val)  
            if(!this.isClosed){
                switch(this.chartType){ 
                    case 'VotesTable':
                        this.votestable();
                        break;             
                    case 'VotesLineChart':
                        this.voteslinechart();
                        break;
                    case 'VotesSpikesChart':
                        this.votesspikeschart();
                        break;   
                    case 'VotesGainLoss':
                        this.votesgainloss();
                        break; 
                    case 'PerLineChart':
                        this.perlinechart();
                        break;  
                    case 'TotalVotesPieChart':
                        this.totalvotespiechart();
                        break;  
                    case 'StackedBarChart':
                        this.stackedbarchart();
                        break;  
                    case 'VotesBarChart':
                        this.votesbarchart();
                        break;                  
                    default:
                        break;
                    }
        }
          
      
            
          
      },   
      number_pages: function(val){
          //console.log("Number of Pages: ", val);                               
          this.parse_vote();
      },
      
      state : function(val){
          //$("#results_table").css("display","none");
          this.activeComponent = ''
          //this.close(); 
          this.isClosed = true      
          this.get_data(this.state).then(()=>{
            console.log("Selected State changed: ", val);  
            this.isClosed = false
            this.selectedindex = 1;
            switch(this.chartType){ 
                case 'VotesTable':
                    this.votestable();
                    break;             
                case 'VotesLineChart':
                    this.voteslinechart();
                    break;
                case 'VotesSpikesChart':
                    this.votesspikeschart();
                    break;   
                case 'VotesGainLoss':
                    this.votesgainloss();
                    break; 
                case 'PerLineChart':
                    this.perlinechart();
                    break;  
                case 'TotalVotesPieChart':
                    this.totalvotespiechart();
                    break;  
                case 'StackedBarChart':
                    this.stackedbarchart();
                    break;    
                case 'VotesBarChart':
                    this.votesbarchart();
                    break;                      
                default:
                    break;
            }
         
          });
          
          
       
          //this.start_tables(val,this.sort_selected);   
      },
      isModalVisible: function() {
        if(this.isModalVisible){
            document.documentElement.style.overflow = 'hidden'
            return
        }

        document.documentElement.style.overflow = 'auto'
    } 

  },                                                 
  
  mounted() {
      
    //console.log("getting started")
    this.get_data(this.state).then( () => {
        this.parse_vote()
        this.isClosed = true
    });
  },
  updated(){
   
  },
                      
  methods: {
      // Mapping Function Used for calculating when vote total decreases and the accumulation
        async get_data(state){                         
            let state_url='https://static01.nyt.com/elections-assets/2020/data/api/2020-11-03/race-page/'+ state.toLowerCase().replace(/\s/,'-') + '/president.json';
            //console.log(state_url)
            
            const res = await fetch(state_url)
            const jobj = await res.json()
            this.timeseries = jobj.data.races[0].timeseries;
            
            this.race_info = {
                race_id: jobj.data.races[0].race_id,
                race_slug: jobj.data.races[0].race_slug,
                url: jobj.data.races[0].url 
                };
            this.parse_data()
          },
        votestable(){               
            this.activeComponent = "VotesTable"
            this.chartType = "VotesTable"
            this.zoomC = '0.90';
            this.activeData = {
                rows: this.vote_rows,
                headers: this.headers
            }
            this.open();          
        },
        voteslinechart(){
            this.isClosed = false
            this.activeComponent = "ChartMaker"
            this.chartType = "VotesLineChart"
            this.activeData = {}
            this.zoomC = '0.8'
           
            //console.log("trump data store",Object.values(this.datedatatrump_store[this.selectedindex]))
           
            const data_sets = [];
            let obj = {
                data: Object.values(this.datedatatrump_store[this.selectedindex]),
                label: "Trump Votes",
                backgroundColor: "rgba(54,73,93,.5)",
                borderColor: "#36495d",
                borderWidth: 3
            };
            data_sets.push(obj);
            obj = {
                data : Object.values(this.datedatabiden_store[this.selectedindex]),
                label : "Biden Votes",
                backgroundColor : "rgba(71, 183,132,.5)",
                borderColor : "#47b784",
                borderWidth : 3
            };
            data_sets.push(obj)
            obj = {
                data: Object.values(this.datedataother_store[this.selectedindex]),
                label: "Other Votes",
                backgroundColor: "lightblue",
                borderColor: "blue",
                borderWidth: 3
            };
            data_sets.push(obj);
            //console.log("Votes Lines Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "line",
                data: {
                    labels: Object.values(this.dateheaders_store[this.selectedindex]),
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    scales: {
                            yAxis:{}
                        }
                }
            }      
            if(this.selectedindex == 1)
                this.open();
        },
        votesspikeschart(){
            this.isClosed = false
            this.activeComponent = "ChartMaker" 
            this.chartType = "VotesSpikesChart"
            this.activeData = {}
            this.zoomC = '0.8' 
            
           
           
            const data_sets = [];
            let obj = {
                data: Object.values(this.datedatatrumpadd_store[this.selectedindex]),
                label: "Trump Spike",
                backgroundColor: "rgba(54,73,93,.5)",
                borderColor: "#36495d",
                borderWidth: 3
            };
            data_sets.push(obj);
            obj = {
                data : Object.values(this.datedatabidenadd_store[this.selectedindex]),
                label : "Biden Spike",
                backgroundColor : "rgba(71, 183,132,.5)",
                borderColor : "#47b784",
                borderWidth : 3
            };
            data_sets.push(obj)
            obj = {
                data: Object.values(this.datedataotheradd_store[this.selectedindex]),
                label: "Other Spike",
                backgroundColor: "lightblue",
                borderColor: "blue",
                borderWidth: 3
            };
            data_sets.push(obj);
            obj = {
                data: Object.values(this.datedatatotaladd_store[this.selectedindex]),
                label: "Total Spike",
                backgroundColor: "pink",
                borderColor: "red",
                borderWidth: 3
            };
            data_sets.push(obj);
            //console.log("Votes Spikes Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "line",
                data: {
                    labels: this.dateheaders_store[this.selectedindex],
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    scales: {
                            yAxis:{}
                        }
                }
            }          
            if(this.selectedindex == 1)
                this.open();
        },
        votesgainloss(){
            this.isClosed = false
            this.activeComponent = "ChartMaker"
            this.chartType = "VotesGainLoss"
            this.activeData = {}
            this.zoomC = '0.8'
            
           
            let data_sets = [];
            let obj = {
                data: Object.values(this.datedatatrumpadddiff_store[this.selectedindex]),
                label: "Trump Gain/Loss",
                backgroundColor: "rgba(54,73,93,.5)",
                borderColor: "#36495d",
                borderWidth: 3
            };
            data_sets.push(obj);
            obj = {
                data : Object.values(this.datedatabidenadddiff_store[this.selectedindex]),
                label : "Biden Gain/Loss",
                backgroundColor : "rgba(71, 183,132,.5)",
                borderColor : "#47b784",
                borderWidth : 3
            };
            data_sets.push(obj)
           
            //console.log("Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "line",
                data: {
                    labels:this.dateheaders_store[this.selectedindex],
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    scales: {
                            yAxis:{}
                        }
                }
            }
            if(this.selectedindex == 1)
                this.open();
        },
        perlinechart(){
            this.isClosed = false           
            this.activeComponent = "ChartMaker"
            this.chartType = "PerLineChart"
            this.activeData = {}
            this.zoomC = '0.8'
           
            let data_sets = [];
            let obj = {
                data: Object.values(this.perremainingtrump_store[this.selectedindex]),
                label: "Trump % of Remaining Vote",
                backgroundColor: "rgba(54,73,93,.5)",
                borderColor: "#36495d",
                borderWidth: 3
            };
            data_sets.push(obj);
            obj = {
                data : Object.values(this.perremainingbiden_store[this.selectedindex]),
                label : "Biden % of Remaining Vote",
                backgroundColor : "rgba(71, 183,132,.5)",
                borderColor : "#47b784",
                borderWidth : 3
            };
            data_sets.push(obj)
           
            //console.log("Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "line",
                data: {
                    labels:this.dateheaders_store[this.selectedindex],
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    scales: {
                            yAxis:{}
                        }
                }
            }
            if(this.selectedindex == 1)
                this.open();
        },

        totalvotespiechart(){
            this.isClosed = false
            this.activeComponent = "ChartMaker"
            this.chartType = "TotalVotesPieChart"
            this.activeData = {}
            this.zoomC = '0.5'
            this.mTop = '-31em'
            //this.fSize = '1.5em'
            
            console.log("Entering Total Votes Pie Chart.....")
            console.log("Trump Slices", this.trump_slices)
           
            let data_sets = [];
            let obj = {
                data: [this.trump_slices[this.selectedindex], this.biden_slices[this.selectedindex],this.other_slices[this.selectedindex]],
                label: "Total Votes",
                backgroundColor: [
                                    "rgba(167,105,0,0.4)",
                                    "red",
                                    "rgba(86,105,0,0.4)"
                                ],
                                borderColor:[
                                    "rgb(167, 105, 0)",
                                    "red",
                                    "rgb(86, 105, 0)"
                                ]
            };
            data_sets.push(obj);
           
            console.log("Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "pie",
                
                data: {
                    labels: ["Trump Votes","Biden Votes","Other Votes"],
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    hoverBorderWidth: 2,
                    scales: {
                        x: {
                                ticks: {
                                    font: {
                                        size: 40,
                                    }
                                }
                            },
                        y: {
                            ticks: {
                                font: {
                                    size: 40,
                                }
                            }
                        },
                    },
                       
                    plugins: {
                        legend: {
                            labels: {
                                // This more specific font property overrides the global property
                                font: {
                                    size: 40
                                }
                            }
                        }
                        }    
                }
            }
            if(this.selectedindex == 1)
                this.open();
        },


        stackedbarchart(){
            this.isClosed = false
            this.activeComponent = "ChartMaker"
            this.chartType = "StackedBarChart"
            this.activeData = {}
            this.zoomC = '0.8'
           // this.mTop = '-31em'
            //this.fSize = '1.5em'
            this.isClosed = false
            console.log("Entering Total Votes Stacked Bar Chart.....")
            console.log("Date Data Trump", this.datedatatrump_store)
            /*
            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(231,233,237)'
                };
                */

            
            let data_sets = [];
            let obj = {
                data: Object.values(this.datedatatrump_store[this.selectedindex]),
                type: 'bar',
                label: 'Trump Votes',
                backgroundColor: "rgba(167,105,0,0.4)",
                borderColor: "rgb(167, 105, 0)",
                borderWidth: 2,
            };
            data_sets.push(obj);

            obj = {
                data: Object.values(this.datedatabiden_store[this.selectedindex]),
                label: "Biden Votes",
                type: 'bar',
                backgroundColor: "pink",
                borderColor: "red",
                borderWidth: 2,
            };
            data_sets.push(obj);

            obj = {
                data: Object.values(this.datedataother_store[this.selectedindex]),
                type: 'bar',
                label: 'Other Votes',
                backgroundColor: "rgba(86,105,0,0.4)",
                borderColor:"rgb(86, 105, 0)",
                borderWidth: 2,
            };
            data_sets.push(obj); 
           
            console.log("Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "bar",
                
                data: {
                    labels: Object.values(this.dateheaders_store[this.selectedindex]),
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    hoverBorderWidth: 2,
                    title: {
                            display: true,
                            text: 'Vote Totals Per Time Interval'
                        },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    },
                    scales: {
                        x: {
                                ticks: {
                                    font: {
                                        size: 20,
                                    }
                                },
                                stacked: true
                            },
                        y: {
                            ticks: {
                                font: {
                                    size: 20,
                                }
                            },
                            stacked: true
                        },
                    },
                       
                    plugins: {
                        legend: {
                            labels: {
                                // This more specific font property overrides the global property
                                font: {
                                    size: 20
                                }
                            }
                        }
                        }    
                }
            }
            if(this.selectedindex == 1)
                this.open();
        },


        votesbarchart(){
            this.isClosed = false
            this.activeComponent = "ChartMaker"
            this.chartType = "VotesBarChart"
            this.activeData = {}
            this.zoomC = '0.8'
           // this.mTop = '-31em'
            //this.fSize = '1.5em'
            this.isClosed = false
            console.log("Entering Total Votes Stacked Bar Chart.....")
            console.log("Date Data Trump", this.datedatatrump_store)
            /*
            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(231,233,237)'
                };
                */

            
            let data_sets = [];
            let obj = {
                data: Object.values(this.datedatatrump_store[this.selectedindex]),
                type: 'bar',
                label: 'Trump Votes',
                backgroundColor: "rgba(167,105,0,0.4)",
                borderColor: "rgb(167, 105, 0)",
                borderWidth: 2,
            };
            data_sets.push(obj);

            obj = {
                data: Object.values(this.datedatabiden_store[this.selectedindex]),
                label: "Biden Votes",
                type: 'bar',
                backgroundColor: "pink",
                borderColor: "red",
                borderWidth: 2,
            };
            data_sets.push(obj);

            obj = {
                data: Object.values(this.datedataother_store[this.selectedindex]),
                type: 'bar',
                label: 'Other Votes',
                backgroundColor: "rgba(86,105,0,0.4)",
                borderColor:"rgb(86, 105, 0)",
                borderWidth: 2,
            };
            data_sets.push(obj); 
           
            console.log("Data Sets: ", data_sets)
            this.activeData = { 
                
                type: "bar",
                
                data: {
                    labels: Object.values(this.dateheaders_store[this.selectedindex]),
                    datasets: data_sets
                },
                options: {
                    responsive: true,
                    lineTension: 1,
                    hoverBorderWidth: 2,
                    title: {
                            display: true,
                            text: 'Vote Totals Per Time Interval'
                        },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    },
                    scales: {
                        x: {
                                ticks: {
                                    font: {
                                        size: 20,
                                    }
                                }
                            },
                        y: {
                            ticks: {
                                font: {
                                    size: 20,
                                }
                            }
                        },
                    },
                       
                    plugins: {
                        legend: {
                            labels: {
                                // This more specific font property overrides the global property
                                font: {
                                    size: 20
                                }
                            }
                        }
                        }    
                }
            }
            if(this.selectedindex == 1)
                this.open();
        },

       helloworld(){
            this.activeComponent = "HelloWorld"
            this.activeData = {
                data: "Hello from Richard!"
            }
            this.open();
       },
       open(){
            window.scrollBy(0,500)
            this.selectedindex = 1
            $('#dyn_component').animate({marginTop:this.mTop,opacity:'0.8'},{duration:"fast"}, {easing:"easein"})
            .css('font-size',this.fSize).css('transform','scale('+this.zoomC+')');
            this.zoomC = '1.0',
            this.isClosed = false;
            this.mTop = '-15em';
            this.fSize = '1em'
           
       },
       close(){
            this.zoomC = '1.0' 
            this.isClosed = true;
            this.activeComponent = "";
            this.mTop = '-15em'
           
            $('#dyn_component').animate({marginTop:'0em',opacity:'0'},{duration:"fast"}, {easing:"easein"});
            this.selectedindex = 1;
           

       },    
       handleUpdatePageTop(pageNum){
            //console.log("goes up to parent")
            this.selectedindex = pageNum

       }, 
       parse_data() {
            //console.log("Selected Sort:",selected_sort)
            //console.log("Race Data:", this.race_info);
           // console.log("Timeseries: ",this.timeseries);

            // Parse Votes for Master Table
            function calc_votes(votes,index){
                                
                var vote_row = {      
                "index": index,
                "votes": votes.votes,
                "timestamp": votes.timestamp,
                "bidenj": votes.vote_shares.bidenj,
                "biden_votes":0,
                "trumpd": votes.vote_shares.trumpd,
                "trump_votes":0,
                "other_votes":0,
                "total_vote_add":0,
                "total_vote_add_trump":0,
                "total_vote_add_biden":0,
                "total_vote_add_other":0,
                "total_vote_add_total":0,
                "percent_of_remaining_trump":0,
                "percent_of_remaining_biden":0,
                //"total_vote_add_bdiff":0,
                // "total_vote_add_tdiff":0,
                "time":votes.timestap
                };
                                    
                return vote_row;
            }


            let pres_votes = this.timeseries.map(calc_votes);
          
            pres_votes = pres_votes.map(function(votes,index){
                if(index == 0){
                    votes.biden_votes = votes.bidenj*votes.votes;
                    votes.trump_votes = votes.trumpd*votes.votes;
                    votes.total_vote_add = votes.votes;
                    votes.total_vote_add_trump = votes.votes * votes.trumpd;
                    votes.total_vote_add_biden = votes.votes * votes.bidenj;
                    votes.total_vote_add_other = votes.votes - (votes.votes * votes.trumpd + votes.votes * votes.bidenj);
                    //votes.total_vote_add_bdiff = votes.votes * votes.bidenj - votes.votes * votes.trumpd;
                    //votes.total_vote_add_tdiff = votes.votes * votes.trumpd - votes.votes * votes.bidenj;
                    votes.other_votes = (1-votes.bidenj-votes.trumpd)*votes.votes;
                }
                else if(index > 0){    
                    if(votes.votes == 0)
                        votes.total_vote_add = 0;
                    else 
                        votes.total_vote_add = pres_votes[index].votes - pres_votes[index-1].votes;


                    if(votes.bidenj == 0)
                        votes.biden_votes = 0;
                        //votes.biden_votes = pres_votes[index-1].biden_votes + votes.total_vote_add*votes.bidenj;
                        votes.biden_votes = votes.bidenj*votes.votes;
                    
                    if(votes.trumpd == 0)
                        votes.trump_votes = 0;
                    else  
                    //votes.trump_votes = pres_votes[index-1].trump_votes + votes.total_vote_add*votes.trumpd;
                    votes.trump_votes = votes.trumpd*votes.votes;

                    votes.other_votes = votes.votes - votes.biden_votes - votes.trump_votes;

                    //votes.total_vote_add_trump = (pres_votes[index].votes - pres_votes[index-1].votes) * votes.trumpd;
                    votes.total_vote_add_trump = votes.votes*votes.trumpd - pres_votes[index-1].votes*pres_votes[index-1].trumpd;
                    //votes.total_vote_add_biden = (pres_votes[index].votes - pres_votes[index-1].votes) * votes.bidenj;
                    votes.total_vote_add_biden = votes.votes*votes.bidenj - pres_votes[index-1].votes*pres_votes[index-1].bidenj;
                    votes.total_vote_add_other = (1-votes.bidenj-votes.trumpd)*votes.votes - pres_votes[index-1].votes*(1 - pres_votes[index-1].bidenj - pres_votes[index-1].trumpd);
                    votes.total_vote_add_total = pres_votes[index].votes - pres_votes[index-1].votes;
                    // votes.total_vote_add_bdiff = (votes.votes*votes.bidenj - pres_votes[index-1].votes*pres_votes[index-1].bidenj) - (votes.votes*votes.trumpd - pres_votes[index-1].votes*pres_votes[index-1].trumpd);
                    // votes.total_vote_add_tdiff = (votes.votes*votes.trumpd - pres_votes[index-1].votes*pres_votes[index-1].trumpd) - (votes.votes*votes.bidenj - pres_votes[index-1].votes*pres_votes[index-1].bidenj);
                }
                return votes;
              });
              //console.log("Total Votes:",pres_votes);
        
            let totalnum_votes = pres_votes[pres_votes.length-1].votes;
            //console.log("Total Num of Votes: ",totalnum_votes);
            let temp_rows = [];
            //if(selected_sort && selected_sort.includes('Time')) {
            //  console.log("Sort Selected: ",selected_sort);
                temp_rows = pres_votes.map(function(vote){                            
                    //return {"votes":vote.votes,"timestamp":vote.timestamp,"bidenj":vote.bidenj,"trumpd":vote.trumpd};
                    vote.percent_of_remaining_trump = vote.total_vote_add_trump*100/(totalnum_votes-vote.votes);
                    vote.percent_of_remaining_biden = vote.total_vote_add_biden*100/(totalnum_votes-vote.votes);
                    return vote;
                });
            // }
            /*
            if(selected_sort && selected_sort.includes('Vote')) {
                console.log("Sort Selected: ",selected_sort);
                temp_rows = pres_votes.map(function(vote){                            
                    //return {"votes":vote.votes,"timestamp":vote.timestamp,"bidenj":vote.bidenj,"trumpd":vote.trumpd};
                    vote.percent_of_remaining_trump = vote.total_vote_add_trump*100/(totalnum_votes-vote.votes);
                    vote.percent_of_remaining_biden = vote.total_vote_add_biden*100/(totalnum_votes-vote.votes);
                    return vote;
                }).sort(function(a, b){return a.votes - b.votes}); 
              }

              */
              //console.log("Total Votes Again:",temp_rows);
              
              this.vote_rows = temp_rows.map(function(vote,index){
                  return {
                    index:index,
                    bidenj:vote.bidenj,
                    biden_votes:vote.biden_votes,
                    trumpd:vote.trumpd,
                    trump_votes:vote.trump_votes,
                    other_votes:vote.other_votes,
                    timestamp:vote.timestamp,
                    votes:vote.votes,
                    vote_add:vote.total_vote_add,
                    trump_added:vote.total_vote_add_trump,
                    biden_added:vote.total_vote_add_biden, 
                    remaining_percent_trump:vote.percent_of_remaining_trump,
                    remaining_percent_biden:vote.percent_of_remaining_biden
                    };
                });
                //console.log("Vote Rows:", this.vote_rows);
                // $('#results_table').show();
                //  if(this2.table)
                //  this2.table.destroy();
                /* 
                $('table.display').css('display','block');
            
                //var this3 = this2;
                seTimeout(function(){ 
                    $('#results_table').show();
                    $('.loader').hide();
                    this.table = $("table.display").DataTable();

                    $("table.display").on( 'page.dt', function () {
                        var info = this.table.page.info();
                        $('#pageInfo').html( 'Showing page: '+info.page+' of '+info.pages );
                        this.selectedindex = info.page;
                        this.number_pages = info.pages;
                        this.linechart();
                        this.linechart2();
                        this.linechart3();
                        this.linechart4();
                        this.piechart();
                        this.stackedchart();
                        this.fill_votebins();
                        this.stackedchart2();
                    } );
                    var info = this.table.page.info();
                    this.number_pages = info.pages; 
                    //this.step = 200000/this.number_pages;
                    //console.log("Step:",this.step);

                    console.log("Pages:", this.number_pages);

                    this.parse_vote();
                    this.linechart();
                    this.linechart2();
                    this.linechart3();
                    this.linechart4();
                    this.piechart();
                    this.fill_votebins();
                    this.stackedchart2();
                    this.stackedchart();                                   
                
                }, 500);
                */
                this.fill_votebins();
    
      },
      start_tables: function(state,sort){
          
          $('.loader').show();
        //  this.parse_data(sort);  

        
          
          
          $('#pieheader').css('display','block');
          
          
      },
      parse_vote(){
            // Derive Headers and Data for Line Chart
              
              var dateheaders = [];
              var datedatabiden = [];
              var datedatabidenadd = [];
              var datedatabidenadddiff = [];
              var datedatatrump = [];
              var datedatatrumpadd = [];
              var datedatatrumpadddiff = [];
              var datedatatotal = [];
              var datedatatotaladd = [];
              var datedataother = [];
              var datedataotheradd = [];
              var perremainingtrump = [];
              var perremainingbiden = [];

              this.dateheaders_store = [];
              this.datedatabiden_store = [];
              this.datedatabidenadd_store = [];
              this.datedatabidenadddiff_store = [];
              this.datedatatrump_store = [];
              this.datedatatrumpadd_store = [];
              this.datedatatrumpadddiff_store = [];
              this.datedatatotal_store = [];
              this.datedataother_store = [];
              this.datedataotheradd_store = [];
              this.datedatatotaladd_store = [];
              this.perremainingtrump_store = [];
              this.perremainingbiden_store = [];


              //console.log("Parse Interval",this.parse_interval);
              for(i=0;i<this.vote_rows.length;i++){
                  if(i == 0){
                      dateheaders.push(this.vote_rows[i].timestamp);
                      datedatabiden.push(this.vote_rows[i].biden_votes);
                      datedatatrump.push(this.vote_rows[i].trump_votes);
                      datedatabidenadd.push(this.vote_rows[i].biden_votes);
                      datedatatrumpadd.push(this.vote_rows[i].trump_votes);
                      datedatabidenadddiff.push(this.vote_rows[i].biden_votes);
                      datedatatrumpadddiff.push(this.vote_rows[i].trump_votes);
                      datedataotheradd.push(this.vote_rows[i].other_votes);
                      datedatatotaladd.push(this.vote_rows[i].votes);
                      datedatatrump.push(this.vote_rows[i].trump_votes);
                      datedatatotal.push(this.vote_rows[i].votes);
                      datedataother.push(this.vote_rows[i].other_votes);
                      perremainingtrump.push(this.vote_rows[i].remaining_percent_trump);
                      perremainingbiden.push(this.vote_rows[i].remaining_percent_biden);
                      
                      
                  }
                  else if( i % this.parse_interval != 0 ){
                      dateheaders.push(this.vote_rows[i].timestamp);
                      datedatabiden.push(this.vote_rows[i].biden_votes);
                      datedatatrump.push(this.vote_rows[i].trump_votes);
                      datedataother.push(this.vote_rows[i].other_votes);
                      datedatabidenadd.push(this.vote_rows[i].biden_votes-this.vote_rows[i-1].biden_votes);
                      datedatatrumpadd.push(this.vote_rows[i].trump_votes-this.vote_rows[i-1].trump_votes);
                      datedataotheradd.push(this.vote_rows[i].other_votes-this.vote_rows[i-1].other_votes);
                      datedatatotaladd.push(this.vote_rows[i].votes-this.vote_rows[i-1].votes);
                      datedatabidenadddiff.push(this.vote_rows[i].biden_votes - this.vote_rows[i-1].biden_votes);
                      datedatatrumpadddiff.push(this.vote_rows[i].trump_votes - this.vote_rows[i-1].trump_votes);
                      datedatatotal.push(this.vote_rows[i].votes);
                      perremainingtrump.push(this.vote_rows[i].remaining_percent_trump);
                      perremainingbiden.push(this.vote_rows[i].remaining_percent_biden);
                  }
                  else if(i % this.parse_interval == 0) {
                      dateheaders.push(this.vote_rows[i].timestamp);
                      datedatabiden.push(this.vote_rows[i].biden_votes);
                      datedatatrump.push(this.vote_rows[i].trump_votes);
                      datedataother.push(this.vote_rows[i].other_votes);
                      datedatatotal.push(this.vote_rows[i].votes);
                      datedatabidenadd.push(this.vote_rows[i].biden_votes-this.vote_rows[i-1].biden_votes);
                      datedatatrumpadd.push(this.vote_rows[i].trump_votes-this.vote_rows[i-1].trump_votes);
                      datedataotheradd.push(this.vote_rows[i].other_votes-this.vote_rows[i-1].other_votes);
                      datedatatotaladd.push(this.vote_rows[i].votes-this.vote_rows[i-1].votes);
                      datedatabidenadddiff.push(this.vote_rows[i].biden_votes - this.vote_rows[i-1].biden_votes);
                      datedatatrumpadddiff.push(this.vote_rows[i].trump_votes - this.vote_rows[i-1].trump_votes);
                      perremainingtrump.push(this.vote_rows[i].remaining_percent_trump);
                      perremainingbiden.push(this.vote_rows[i].remaining_percent_biden);


                      this.dateheaders_store.push(dateheaders);
                      dateheaders = []; 
                      this.datedatabiden_store.push(datedatabiden);
                      datedatabiden = [];
                      this.datedatabidenadd_store.push(datedatabidenadd);
                      datedatabidenadd = [];
                      this.datedatatrump_store.push(datedatatrump);
                      datedatatrump = [];  
                      this.datedatatrumpadd_store.push(datedatatrumpadd);
                      datedatatrumpadd = [];  
                      this.datedatatotal_store.push(datedatatotal);
                      datedatatotal = []; 
                      this.datedataother_store.push(datedataother);
                      datedataother = [];     
                      this.datedataotheradd_store.push(datedataotheradd);
                      datedataotheradd = [];       
                      this.datedatatotaladd_store.push(datedatatotaladd);
                      datedatatotaladd = [];  
                      this.datedatabidenadddiff_store.push(datedatabidenadddiff);
                      datedatabidenadddiff = [];       
                      this.datedatatrumpadddiff_store.push(datedatatrumpadddiff);
                      datedatatrumpadddiff = [];    
                      this.perremainingtrump_store.push(perremainingtrump);
                      perremainingtrump = [];
                      this.perremainingbiden_store.push(perremainingbiden);
                      perremainingbiden = [];                                          
                  }
                  else{
                      dateheaders.push(this.vote_rows[i].timestamp);
                      datedatabiden.push(this.vote_rows[i].biden_votes);
                      datedatatrump.push(this.vote_rows[i].trump_votes);
                      datedataother.push(this.vote_rows[i].other_votes);
                      datedatatotal.push(this.vote_rows[i].votes);
                      datedatabidenadd.push(this.vote_rows[i].biden_votes-this.vote_rows[i-1].biden_votes);
                      datedatatrumpadd.push(this.vote_rows[i].trump_votes-this.vote_rows[i-1].trump_votes);
                      datedataotheradd.push(this.vote_rows[i].other_votes-this.vote_rows[i-1].other_votes);
                      datedatatotaladd.push(this.vote_rows[i].votes-this.vote_rows[i-1].votes);
                      datedatabidenadddiff.push(this.vote_rows[i].biden_votes - this.vote_rows[i-1].biden_votes);
                      datedatatrumpadddiff.push(this.vote_rows[i].trump_votes - this.vote_rows[i-1].trump_votes);
                      perremainingtrump.push(this.vote_rows[i].remaining_percent_trump);
                      perremainingbiden.push(this.vote_rows[i].remaining_percent_biden);
                  }

              }
          
              //console.log("Date Total Add: ", this.datedatatotaladd_store);
              //console.log("Date Biden Add Diff: ", this.datedatabidenadddiff_store);
              //console.log("Date Trump Add Diff: ", this.datedatatrumpadddiff_store);

              // PieChart calculations
              var totalslices = [];
              var bidenslices = [];
              var trumpslices = [];
              var otherslices = [];
              var pieheaders = [];
              if(this.datedatabiden_store != null) {
                  for(var i = 0;i < this.datedatabiden_store.length;i++){
                          var total_amt = 0;
                          var total_biden = 0;
                          var total_trump = 0;
                          var total_other = 0;
                          for(var j = 0;j < this.datedatatotal_store[i].length;j++){
                              total_amt += this.datedatatotal_store[i][j];
                              total_biden += this.datedatabiden_store[i][j];
                              total_trump += this.datedatatrump_store[i][j];
                              total_other += this.datedataother_store[i][j];
                              if(j == 0 ){
                                  pieheaders[i] = this.dateheaders_store[i][j] + " To ";
                              }
                              if(j == this.dateheaders_store[i].length-1){
                                  pieheaders[i] +=  this.dateheaders_store[i][j];
                              }
                          // console.log(pieheaders);
                          }
                          totalslices.push(total_amt);                             
                          bidenslices.push(total_biden);                           
                          trumpslices.push(total_trump);                               
                          otherslices.push(total_other);
                      }
              }

          this.biden_slices = bidenslices;
          this.trump_slices = trumpslices;
          this.other_slices = otherslices;
          this.total_slices = totalslices;
          this.pie_headers = pieheaders;

          //console.log("Other Slices: ",otherslices);



  
      },
      fill_votebins(){

          // Set up Vote Bins
          let index = 0;
          let interval = 0;
          this.vote_bins = [];
          var vote_bin = {
              "interval":0,
              "biden_in_bin": 0,
              "trump_in_bin":0,
          };
        
          this.number_pages = Math.ceil(this.vote_rows.length/this.pageSize)  
          //console.log("Number of Pages: ",this.number_pages)
          let step = parseInt(200000/(this.number_pages*10));
          //let step = 2500;
          
          //console.log("Step",step);

          while(interval <= 200000){
              vote_bin.interval = interval;
              vote_bin.trump_in_bin = 0;
              vote_bin.biden_in_bin = 0;
              this.vote_bins[index] = vote_bin;
           
              index++;
              interval = interval + step;
              
              vote_bin = {
                  "interval":0,
                  "biden_in_bin": 0,
                  "trump_in_bin":0,
              };

          }


          // Put in Biden Bins
          for(let j = 0;j<this.datedatabidenadddiff_store.length;j++){
              let store = this.datedatabidenadddiff_store[j];
              for(let k=0;k < store.length;k++){
                  for(let l = 0;l < this.vote_bins.length;l++){
                      //console.log("Store value:",store[k]);
                      if(l > 0)
                          if(store[k] < this.vote_bins[l].interval && store[k] >= this.vote_bins[l-1].interval)
                              this.vote_bins[l].biden_in_bin++;
                  }
              }          
          }

          // Put in Trump Bins
          for(let j = 0;j<this.datedatatrumpadddiff_store.length;j++){
              let store = this.datedatatrumpadddiff_store[j];
              for(let k=0;k < store.length;k++){
                  for(let l = 0;l < this.vote_bins.length;l++){
                      if(l > 0)
                          if(store[k] < this.vote_bins[l].interval && store[k] >= this.vote_bins[l-1].interval)
                              this.vote_bins[l].trump_in_bin++;
                  }
              }            
          }
          //console.log("Vote Bins: ",this.vote_bins);

          this.bin_headers = [];
          this.bin_biden = [];
          this.bin_trump = [];
          // Just for update

          index = 0;
          for(let i=0;i<this.vote_bins.length;i++){
                  if(i == 0){
                      this.bin_headers[index] = [];
                      this.bin_biden[index] = [];
                      this.bin_trump[index] = [];
                      this.bin_headers[index].push(this.vote_bins[i].interval);
                      this.bin_biden[index].push(this.vote_bins[i].biden_in_bin);
                      this.bin_trump[index].push(this.vote_bins[i].trump_in_bin);
                      
                  }
                  else if( i % this.parse_interval != 0 ){
                      this.bin_headers[index].push(this.vote_bins[i].interval);
                      this.bin_biden[index].push(this.vote_bins[i].biden_in_bin);
                      this.bin_trump[index].push(this.vote_bins[i].trump_in_bin);
                  }
                  else if(i % this.parse_interval == 0) {
                      this.bin_headers[index].push(this.vote_bins[i].interval);
                      this.bin_biden[index].push(this.vote_bins[i].biden_in_bin);
                      this.bin_trump[index].push(this.vote_bins[i].trump_in_bin);
                      
                      index++;     
                      this.bin_headers[index] = [];
                      this.bin_biden[index] = [];
                      this.bin_trump[index] = [];     
                  }
                  else{
                      this.bin_headers[index].push(this.vote_bins[i].interval);
                      this.bin_biden[index].push(this.vote_bins[i].biden_in_bin);
                      this.bin_trump[index].push(this.vote_bins[i].trump_in_bin);
                  }

              }
          
      },

    
},

computed: {
        pres_vote_rows :  function(){                            
            //console.log("New Vote Rows:", this.vote_rows);                              
            return this.vote_rows;
        },
        selected_index : function(){
            let sindex = this.selectedindex;
            //console.log("New Selected Index:", sindex);
            return sindex
        },
        active_data : function(){
            return this.activeData
        }
        
    }
                     
}
</script>

<style>
 
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  #barChart{
      background-color: wheat;
      border-radius: 6px;
      /*   Check out the fancy shadow  on this one */
      box-shadow: 0 3rem 5rem -2rem rgba(0, 0, 0, 0.6);
  }
  .fxchart{
      background-color: beige;
      padding-top: 1em

  }
  div.jumbotron p{
          font-size:1.0em;
          text-align:center
        }

  div.jumbotron h2, div.jumbotron h1, h2#trumpvoteloss, h1.voteloss {
          text-align:center
        }



  #pieheader{
      text-align:center;
      display:none
  } 

  #results_table{
      display:block
  }


  .dataTables_wrapper{
      margin-left:-31.5%;
    
  }


  #charts [class*="col"] {
      border:2px dashed black;
      padding:0.5em;
  }

  [v-cloak] > * { display:none; }
  [v-cloak]::before { content: "loading..."; }

  .loader {
      position:relative;
      border: 16px solid #f3f3f3; /* Light grey */
      border-top: 16px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 120px;
      height: 120px;
      left: 45%;
      top:15%;
      animation: spin 1s linear infinite;
  }

  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
 
  #dyn_component{
    position:relative;
    margin-top:0em;
    z-index:200;
    width: 100%;
    display: inline-block;
    background-color:beige;
    opacity:0;
    -webkit-transition: all 1s linear;
    -moz-transition: all 1s linear;
    -o-transition: all 1s linear;
    transition: all 1s linear;
    overflow:hidden;
  }
  .bClose {
    transform: scale(1.5)
  }
</style>
