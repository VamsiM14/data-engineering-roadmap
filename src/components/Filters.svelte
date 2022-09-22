<script>
import CardStore from '../stores/CardStore.js';


let copiedMainInfo = $CardStore;
let presentingMainInfo = copiedMainInfo;

const filterFreeResources = (MainInfo) => {
    console.log('MainInfo:', MainInfo)
    
    for (let lev2Item of MainInfo) {
        // console.log('typeof MainInfo.resourceList:', typeof lev2Item.resouceList, lev2Item.resouceList)
        console.log('lev2item', lev2Item, 'typeof:', typeof lev2Item)
        console.log('lev2Item.resouceList', lev2Item.resouceList)
        lev2Item.resouceList = lev2Item.resouceList.filter(item => (item.freeResource === true))
        console.log('lev2Item.resouceList-AFTER FILTER', lev2Item.resouceList)
    }
    
    console.log('MainInfo-after', MainInfo)
};



const handleFilter = (filterName) => {
    if (filterName === "Show All") {
        CardStore.set(copiedMainInfo);
    } else if (filterName === "Free resources") {
        console.log('BEFORE STORE SETTING', $CardStore)
        filterFreeResources(presentingMainInfo);
        console.log(presentingMainInfo);
        CardStore.update((i) => { return presentingMainInfo});
        console.log('AFTER STORE SETTING')
        console.log($CardStore)
    } else {
        let a = 2;
    }
};

console.log('OOFS', $CardStore);
</script>

<ul class="filters">
    <button class="left" on:click={() => handleFilter("Show All")}>Show All</button>
    <button class="middle_one" on:click={() => handleFilter("Free resources")}>Free resources</button>
    <button class="middle_two" on:click={() => handleFilter("Books")}>Books</button>
    <button class="right" on:click={() => handleFilter("Courses")}>Courses</button>
</ul>
    
    
<style>
    ul{
        list-style-type: none; 
    }
  
  
  
    .filters{
        display: flex;
        justify-content: center;
        /* margin: 100px; */
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

</style>