<template>
    <div class="fxchart container">
        <div class="row">
            <div class="col-sm-4"></div>
            <div class="col-sm-4">                       
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Choose Chart Resolution</label>
                    </div>
                    <select v-model="selected" class="custom-select" id="inputGroupSelect01">
                        <option>1 Times</option>
                        <option>5 Times</option>
                        <option>10 Times</option>
                        <option>15 Times</option>
                    </select>
                </div>                     
            </div>
            <div class="col-sm-4"></div>
        </div>
    </div>
</template>
<script>
    import { ref } from 'vue'
    export default {

        setup(){
            let selected = ref('1 Times')

            return {
                selected
            }
        }

    };
</script>
