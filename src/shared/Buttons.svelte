<script>
    export let cardStatus = 'less';
    let upArrowImgPath = 'img/arrow_up.svg';
    let downArrowImgPath = 'img/arrow_down.svg';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
</script>

<button on:click={ () => dispatch('ShowContent', cardStatus)}><img class="button" src={ cardStatus ? upArrowImgPath : downArrowImgPath }>{ cardStatus ? "Show less" : "Show more" }</button>


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