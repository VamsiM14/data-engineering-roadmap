import { writable } from "svelte/store";

const ResourceStore = writable([
    {
        id: 1,
        resourceType: 'book',
        resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
        freeResource: false,
        coverageMeasure: 1,
        depthMeasure: 3
    },
    {
        id: 2,
        resourceType: 'text',
        resourceName: 'Tutorials Point SQL tutorial - tutorials point',
        freeResource: true,
        coverageMeasure: 4,
        depthMeasure: 3
    },
    {
        id: 3,
        resourceType: 'video',
        resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
        freeResource: true,
        coverageMeasure: 3,
        depthMeasure: 3
    }
]);

export default ResourceStore;