<script>
	// export let name;
	import Filters from './components/Filters.svelte';
	import Bars from './shared/Bars.svelte';
	import Card from './shared/Card.svelte';
</script>

<main>
	<h1>Awesome Data Engineering</h1>
	<p class="step_1">Learning path and resources to become a data engineer<p>
	<p class="step_2">Best books, best courses and best articles on each subject.<p>
	<p class="step_2">Other sections: Data engineering best books<p>
	<p class="step_3">How to read it: First, not every subject is required to master. Look for the "essentiality" measure. Then, each resource standalone for its measurements. "coverage" and "depth" are relative to the subject of the specific resource, not the entire category.</p>
	<Filters />
	<Card heading={"SQL"}/>
	
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #1a73e8;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.step_1{
		font-size:x-large;
	}

	.step_2{
		font-size: large;
	}

	.step_3{
		font-size: medium;
		max-width: 900px;
		text-align: center;
		margin-left: auto;
    	margin-right: auto;
	}

</style>