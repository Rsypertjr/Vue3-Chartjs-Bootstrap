<template>
    <div class="fxchart container">
        <div class="row">
            <div class="col-sm-4"></div>
            <div class="col-sm-4">                       
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Choose Chart Resolution</label>
                    </div>
                    <select @change="onChange($event)" v-model="selected" class="custom-select" id="inputGroupSelect01">
                        <option :value="1">1 Times</option>
                        <option :value="5">5 Times</option>
                        <option :value="10">10 Times</option>
                        <option :value="15">15 Times</option>
                    </select>
                </div>                     
            </div>
            <div class="col-sm-4"></div>
        </div>
    </div>
</template>
<script>
    import { ref } from 'vue';
    export default {
        props:{},
        setup(props,context){
            let selected = ref(1);


            function onChange(event){
                context.emit("selectResolution",event.target.value);
            }

            return {
                selected,
                onChange
            }
        },

    };
</script>
