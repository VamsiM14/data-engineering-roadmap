<script>
    export let cardStatus = 'more';
    let upArrowImgPath = 'img/arrow_up.svg';
    let downArrowImgPath = 'img/arrow_down.svg';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
/*Notes: 
 () => dispatch('ShowContent', cardStatus)
*/
</script>

<button on:click={ () => dispatch('ShowContent', cardStatus) }><img class="button" src={ cardStatus === 'more' ? downArrowImgPath : upArrowImgPath }>{ cardStatus === 'more' ? "Show more" : "Show less" }</button>


<style>
    
    button{
        width: 100%;
        border: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 15px;
    }

    img.button{
        max-width: 25px;
    }
    
</style>