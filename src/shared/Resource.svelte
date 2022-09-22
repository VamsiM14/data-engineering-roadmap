<script>
    // import CardStore from '../stores/CardStore.js';
    import Bars from './Bars.svelte';
    import Buttons from './Buttons.svelte';
    import { fade, fly } from 'svelte/transition';


    // let copiedResources = $CardStore;
    export let resourceInfo;
    $: console.log('resourceInfo:', resourceInfo);
    // let slicedResources = resourceInfo.slice(0,3);
    // console.log('SLICEDRESOURCES:', slicedResources);
    // let slicedResources = resourceInfo.slice(0,3);
    // let slicedResources = $SlicedCardStore;
    // $: console.log('sliced res',slicedResources);
    $: presentingResources = resourceInfo.slice(0,3);

    export let cardStatus = 'more';
    let img_src = ''; //shld we use export ? --> No, confine these components to local (Resource level)
    let img_alt = ''; //shld we use export ? -->  No, confine these components to local (Resource level)

    const assignImgAttrForResourceType = (resource) => {
        let msg = '';
        if (resource.resourceType === 'book') {
            msg = {img_src:'img/book.svg',img_alt:'book'}
            return msg;
        } else if (resource.resourceType === 'text') {
            msg = {img_src:'img/article.svg', img_alt:'text'}
            return msg
        } else if (resource.resourceType === 'video') {
            msg = {img_src:'img/course.svg', img_alt:'video'}
            return msg
        } else if (resource.freeResource) {
            msg = {img_src:'img/icons8-free-67.png', img_alt:'free'}
            return msg
        }
    }
    
    const assignImgAttrForfreeResource = (resource) => {
        let msg = '';
        
        if (! resource.freeResource) {
            img_src='img/dollar.svg';
            img_alt='dollar'
            msg = {img_src,img_alt}
            return msg
        } else {
            img_src='img/free.svg';
            img_alt='free'
            msg = {img_src,img_alt}
            return msg
        }
    }

    const ToggleShowContent = (e) => {
        
        console.log('entered ToggleShowContent');
        console.log(e.detail);
        if (e.detail ===  'less') {
            presentingResources = presentingResources.slice(0,3);
            console.log("less >", presentingResources);
            cardStatus = 'more';
        } else if (e.detail === 'more') {
            presentingResources = resourceInfo;
            console.log("more >", presentingResources)
            cardStatus = 'less';
        }
    }

/*
Notes:
*/
</script>


    {#each presentingResources as resource (resource.id)}
        <div class="resource" transition:fly="{{ y:200, duration: 500}}">
            <div class="top">
                <img src="{ assignImgAttrForResourceType(resource).img_src }" alt="{ assignImgAttrForResourceType(resource).img_alt }" > 
                <p class="resourceName"><a href="{resource.webLink}" target="_blank">{resource.resourceName}</a></p>
            </div>
            <div class="bottom">
                <img src="{ assignImgAttrForfreeResource(resource).img_src }" alt="{ assignImgAttrForfreeResource(resource).img_alt }">
                <div class="bars">
                    <Bars label={"coverage"} steps={resource.coverageMeasure}/>
                    <Bars label={"depth"} steps={resource.depthMeasure}/>
                </div>
            </div>
        </div>
    {/each}
    <div class="showButton">
        <Buttons {cardStatus} on:ShowContent={ToggleShowContent}/>
    </div>

<style>

    .resource{
        border-bottom: 2px dashed black;
        display: flex;
        flex-direction: column;
    }

    /* .resource:hover{
        background-color: #d0d0e1;
    } */

    .resourceName{
        font-weight: bold;
    }

    .top{
        display: flex;
        justify-content: left;
        margin: 0px 0px 0px 20px;
        gap: 10px;

    }

    .bottom{
        display: flex;
        gap: 10px;
        margin: 0px 0px 20px 20px;
    }

    .bars{
        display: flex;
        gap: 20px;
    }

    p{
        text-align: left;
    }

    a{
        color: black;
    }

    img{
        max-width: 35px;
    }

</style>