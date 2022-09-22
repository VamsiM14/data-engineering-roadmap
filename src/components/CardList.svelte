<script>
/*
Component to hold all cards, each representing a unique skill.
*/
import Card from '../shared/card.svelte';
// import CardStore from '../stores/CardStore.js';
import CardStoreWrite from '../stores/CardStoreWrite.js';

//Variables
$: copiedCardStore = $CardStoreWrite;
$: console.log(copiedCardStore)

let connectingImgRight = 'img/curve-right.svg'
let connectingImgLeft = 'img/curve-left.svg'
</script>
{#each copiedCardStore as cardDetails (cardDetails.id)}
    <div class="listBody">
        <div class={ cardDetails.id % 2 === 0 ? "card even" : "card odd" }>
            <p>{cardDetails.resouceList.length}</p>            
            <Card {cardDetails}/>
        </div>    
        <div class="connectingImg">
            <img class="mx-auto w-4/6" src={ cardDetails.id % 2 === 0 ? connectingImgLeft: connectingImgRight} alt="connectingImg">
        </div>
    </div>
    
{/each}


<style>
    img{
        width: 100%;
        height: 100px;
    }

    .listBody{
        display: flex;
        flex-direction: column;
        margin-top: 0px;
    }

    .mx-auto{
        margin-left: auto;
        margin-right: auto;
    }

    .w-4\/6{
        width: 66.666667%;
    }

    .even {
        align-self: flex-end;
        margin-right: 60px;
    }
    
    .odd {
        align-self: flex-start;
        margin-left: 60px;
    }


</style>