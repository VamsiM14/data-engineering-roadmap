<script>
    import ResourceStore from '../stores/ResourceStore.js';
    import Bars from './Bars.svelte';
    import Buttons from './Buttons.svelte';
    let resources = $ResourceStore;
    let img_src = ''; //shld we use export ?
    let img_alt = ''; //shld we use export ?
    let cardStatus = 'less';

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

    const ToggleShowContent = (cardStatus) => {
        if (cardStatus ===  'less') {
            cardStatus = 'more'
        } else {
            cardStatus = 'less'
        }
    }

//     const contentVisibility = (cardStatus) => {
//     let copiedResourceStore = $ResourceStore;

//     //if cardStatus == less then copiedResourceStore = copiedResourceStore[:3] 
//     //else 

// }

//notes:
//line26:   assignImgSrc().msg.
//alt="{msg.img_src}"
// if (! resource.freeResource) {
    // img_src='img/dollar.svg';
    //         img_alt='purchasable';
    //         msg = {img_src,img_alt}
    //         return msg;
    //     }
        // let msg = {img_src:'img/course.svg', img_alt:'video'};
        // #1a73e8
    //if cardStatus == less then 
        //if r.id <= 3 {....} 
    //else if cardStatus == more then 
        //
</script>


    {#if (cardStatus === 'less') }
        {#each resources as resource  (resource.id)}
            {#if (resource.id <= 3) } 
                <div class="resource">
                    <div class="top">
                        <img src="{ assignImgAttrForResourceType(resource).img_src }" alt="{ assignImgAttrForResourceType(resource).img_alt }" > 
                        <p class="resourceName"><a href="">{resource.resourceName}</a></p>
                    </div>
                    <div class="bottom">
                        <img src="{ assignImgAttrForfreeResource(resource).img_src }" alt="{ assignImgAttrForfreeResource(resource).img_alt }">
                        <div class="bars">
                            <Bars label={"coverage"} steps={resource.coverageMeasure}/>
                            <Bars label={"depth"} steps={resource.depthMeasure}/>
                        </div>
                    </div>
                </div>
            {/if}
        {/each}
        <div class="showButton">
            <Buttons {cardStatus} on:ShowContent={ToggleShowContent}/>
        </div>
    
    {:else if (cardStatus === 'more') }
        <div class="resource">
            <div class="top">
                <img src="{ assignImgAttrForResourceType(resource).img_src }" alt="{ assignImgAttrForResourceType(resource).img_alt }" > 
                <p class="resourceName"><a href="">{resource.resourceName}</a></p>
            </div>
            <div class="bottom">
                <img src="{ assignImgAttrForfreeResource(resource).img_src }" alt="{ assignImgAttrForfreeResource(resource).img_alt }">
                <div class="bars">
                    <Bars label={"coverage"} steps={resource.coverageMeasure}/>
                    <Bars label={"depth"} steps={resource.depthMeasure}/>
                </div>
            </div>
            <div class="showButton">
                <Buttons {cardStatus} on:ShowContent={ToggleShowContent}/>
            </div>
        </div> 
    {/if}

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

</style>