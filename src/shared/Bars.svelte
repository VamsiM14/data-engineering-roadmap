<script>
    export let label = '';
    export let steps;
    const maxSteps = 5;
</script>

<div class="bar">
    <div class="label">{label}</div>
    <div class="stepBody">
        {#each Array(maxSteps) as stepNo, i}
            <div class="step" class:fill={ i < steps }></div>
        {/each}
        
    </div>
</div>


<style>
    
    .bar{
        display: flex;
        flex-direction: column;
        align-items: center;
        /* margin: 5px; */
        gap: 5px;
    }

    .label{
        font-size: 17px;
    }

    .stepBody{
        display: flex;
        justify-content: left;
    }

    .step{
        border: 0.15rem solid #1a73e8;
        width: 10px;
        height: 2px;
        margin-right: 1px;
    }

    .step.fill{
        background-color: #1a73e8;
    }
</style>