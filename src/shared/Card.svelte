<script>
    import Bars from './Bars.svelte';
    import Resource from './Resource.svelte';
    import Buttons from './Buttons.svelte';
    export let heading = '';
    import ResourceStore from '../stores/ResourceStore';
    import { fade, scale, slide } from 'svelte/transition';
//

</script>

<div class="card">
    <div class="main">
        <h3 class="heading">{heading}</h3>
        <Bars label={'essentiality'} steps={3}/>
        <p>Querying data using SQL is an essential skill for anyone who works with data</p>
    </div>
    <div class="resource" in:slide out:slide>
        <Resource />
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
        margin: 70px auto auto 20px;
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
    }

    /* .show{
        width: 100%;
        text-align: center;
    } */
</style>