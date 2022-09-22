import { writable } from "svelte/store";

const CardStatusStore = writable (
    [{
        CardStatus: 'more'
    }]
);

export default CardStatusStore;