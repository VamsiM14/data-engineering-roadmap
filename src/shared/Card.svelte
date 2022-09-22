<script>
    import Bars from './Bars.svelte';
    import Resource from './Resource.svelte';
    import Buttons from './Buttons.svelte';
    export let heading;
    export let desc;
    export let essentialityMeasure;
    export let cardDetails = {};
    import CardStore from '../stores/CardStore.js';
    import { fade, scale, slide } from 'svelte/transition';
//in:fade out:fade

    let skillList = {};
    let skillName;
    let resourceInfo;

    const sliceResources = () => {
        /*
        Slice resourceList so that skillCards hold only 1 resource details. This can be used in the default view (with "Show more" button 
        being visible). Upon clicking the button "Show more",  Resource.svelte's ToggleShowContent() function is called to toggle minimal resouce
        list with 1 resource to original resource list that can contain more than 1 resource list. 
        */
        let slicedResources = copiedResources;
        console.log('typeof before:', typeof(slicedResources));
        for (let skillCard of slicedResources) {
            skillCard.resouceList = skillCard.resouceList.slice(0,1);
        }
        console.log(slicedResources, 'typeof after:', typeof(slicedResources));
    };
    // sliceResources();
    
    // for (let skillInfo of CardStore) {
    //     console.log(skillInfo.id);
    //     skillList[skillInfo.skill] = skillInfo.id;
    // }
    // console.log(Object.keys(skillList), '*******', skillList);

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