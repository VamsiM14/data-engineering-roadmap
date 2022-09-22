<script>
    import Bars from './Bars.svelte';
    import Resource from './Resource.svelte';
    import Buttons from './Buttons.svelte';
    export let cardDetails = {};
    import CardStore from '../stores/CardStore.js';
    import { fade, scale, slide } from 'svelte/transition';

    let resourceInfo;

</script>

<div class="card">
    <div class="main">
        <h3 class="heading">{cardDetails.skill}</h3>
        <Bars label={'essentiality'} steps={cardDetails.essentialityMeasure}/>
        <p>{cardDetails.desc}</p>
    </div>
    <div class="resource" >
        <Resource resourceInfo={cardDetails.resouceList} />
    </div>
</div>

<style>
    .card{
        background-color: #f4f4f4;
        border-radius: 10px;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items:flex-start;
        padding: 20px auto auto 20px;
        margin: 0px auto auto 20px;
    }

    .main{
        margin: 20px auto auto 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0px;
        padding: 0px;
    }

    .resource{
        width: 100%;
    }

    p{
        text-align: left;
        margin-right: 10px;
    }

    /* .show{
        width: 100%;
        text-align: center;
    } */
</style>