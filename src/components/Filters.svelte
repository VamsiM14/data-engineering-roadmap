<script>
import CardStore from '../stores/CardStore.js';
import CardStoreWrite from '../stores/CardStoreWrite.js';
import CardStoreCopy from '../stores/CardStoreCopy.js';
import CardStoreCopy2 from '../stores/CardStoreCopy2.js';
import CardStoreCopy3 from '../stores/CardStoreCopy3.js';
import CardStoreCopy4 from '../stores/CardStoreCopy4.js';


// let copiedCardStore = $CardStore;
let bufferMainInfo = $CardStore;

// let copiedMainInfo = bufferMainInfo;
let presentingMainInfo = bufferMainInfo;

const filterResources = (MainInfo, filterName) => {
    console.log('MainInfo:', MainInfo)
    
    for (let lev2Item of MainInfo) {
        // console.log('typeof MainInfo.resourceList:', typeof lev2Item.resouceList, lev2Item.resouceList)
        console.log('lev2item', lev2Item, 'typeof:', typeof lev2Item)
        console.log('lev2Item.resouceList', lev2Item.resouceList)
        lev2Item.resouceList = lev2Item.resouceList.filter(item => ((filterName === "Free resources") ? item.freeResource === true : item.resourceType === filterName))
        console.log('lev2Item.resouceList-AFTER FILTER', lev2Item.resouceList)
    }
    
    console.log('MainInfo-after', MainInfo)

};

const handleFilter = (filterName) => {
    if (filterName === "Show All") {
        console.log('entered SHoww All')
        CardStoreWrite.set($CardStoreCopy4);
        console.log('$cARDSTOREcopy:',$CardStoreCopy)
        console.log('$cARDSTOREwRITE:',$CardStoreWrite)
    } else if (filterName === "Free resources") {
        presentingMainInfo = $CardStore
        filterResources(presentingMainInfo, "Free resources");
        console.log(presentingMainInfo);
        CardStoreWrite.update((i) => { return presentingMainInfo});

        console.log('AFTER STORE SETTING')
        // console.log($CardStore)
    } else if (filterName === "Books"){
        presentingMainInfo = $CardStoreCopy
        filterResources(presentingMainInfo, "book");
        CardStoreWrite.update((i) => { return presentingMainInfo});
    } else if (filterName === "Courses"){
        presentingMainInfo = $CardStoreCopy2
        filterResources(presentingMainInfo, "video");
        CardStoreWrite.update((i) => { return presentingMainInfo});
    }
};


// const udpateResourceLinks = (MainInfo) => {
//     for (let lev2Item of MainInfo) {
//         for (let lev3Item of lev2Item.resouceList) {
//             lev3Item["webLink"] = ""
//         }
//     }
//     CardStoreWrite.update((i) => { return MainInfo});
// };

// udpateResourceLinks(presentingMainInfo);
// console.log('OOFS', $CardStore);
</script>
<section>
    <ul class="filters z-10 top-0 sticky" >
        <button class="left" on:click={() => handleFilter("Show All")}>Show All</button>
        <button class="middle_one" on:click={() => handleFilter("Free resources")}>Free resources</button>
        <button class="middle_two" on:click={() => handleFilter("Books")}>Books</button>
        <button class="right" on:click={() => handleFilter("Courses")}>Courses</button>
    </ul>
</section>
    
<style>
    ul{
        list-style-type: none; 
        
    }
    
    section {
        background-color: white;
        position: relative;
    }

    .filters{
        display: flex;
        justify-content: center;
        /* margin: 100px; */
        /* position: fixed; */
        top: 400px;
        left: 550px;
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        margin: 0 auto 0 auto;


    }

    li{
        margin: 10px;
    }

    .left{
        border-top-left-radius: 25px;
        border-bottom-left-radius: 25px;
        border-right: 0px;
        padding: 10px;
    }

    .left:focus{
        border-left: #1a73e8 5px solid;
    }
    
    .right:focus{
        border-right: #1a73e8 5px solid;
    }
    
    .middle_one{
        border-left: 0px;
        border-right: 0px;
        padding: 10px;
    }
    
    .middle_two{
        border-left: 0px;
        border-right: 0px;
        padding: 10px;
    }
    
    .right{
        border-top-right-radius: 25px;
        border-bottom-right-radius: 25px;
        border-left: 0px;
        padding: 10px;
    }

    button:hover{
        cursor: pointer;
        background-color: #1a73e8;
        color: #eee;
    }

    button:focus{
        border-top: #1a73e8 2px solid;
        border-bottom: #1a73e8 2px solid;
    }
</style>