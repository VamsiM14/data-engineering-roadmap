import { readable } from "svelte/store";

const CardStoreCopy = readable([
    {
        id: 1,
        skill: 'SQL',
        essentialityMeasure: 3,
        desc: 'Querying data using SQL is an essential skill for anyone who works with data',
        resouceList: [{
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
        },
        {
            id: 4,
            resourceType: 'book',
            resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 5,
            resourceType: 'text',
            resourceName: "Code academy SQL tutorial - interactive - code academy",
            freeResource: true,
            coverageMeasure: 3,
            depthMeasure: 2
        },
        {
            id: 6,
            resourceType: 'text',
            resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
            freeResource: true,
            coverageMeasure: 4,
            depthMeasure: 3
        },
        {
            id: 7,
            resourceType: 'video',
            resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        }
        ],
        CardStatus: "more"
    },
    {
        id: 2,
        skill: 'Programming language',
        essentialityMeasure: 3,
        desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
        resouceList: [{
            id: 1,
            resourceType: 'book',
            resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 4
        },
        {
            id: 2,
            resourceType: 'book',
            resourceName: 'Learning Python, 5th Edition - Mark Lutz',
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 3,
            resourceType: 'text',
            resourceName: 'The Python Tutorial - Python documentation',
            freeResource: true,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 4,
            resourceType: 'video',
            resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 5,
            resourceType: 'video',
            resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 6,
            resourceType: 'video',
            resourceName: 'Python for Everybody - University Of Michigan',
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        ],
        CardStatus: "more"
    },
    {
        id: 3,
        skill:'Relational Databases - Design & Architecture',
        essentialityMeasure: 3,
        desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
        resouceList: [{
            id: 1,
            resourceType: 'video',
            resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
            freeResource: true,
            coverageMeasure: 5,
            depthMeasure: 4
        },
        {
            id: 2,
            resourceType: 'book',
            resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 3,
            resourceType: 'text',
            resourceName: "Normalization of Database - studytonight.com",
            freeResource: true,
            coverageMeasure: 4,
            depthMeasure: 4
        },
        {
            id: 4,
            resourceType: 'book',
            resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
            freeResource: false,
            coverageMeasure: 5,
            depthMeasure: 5
        },
        {
            id: 5,
            resourceType: 'text',
            resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
            freeResource: true,
            coverageMeasure: 4,
            depthMeasure: 3
        },
        {
            id: 6,
            resourceType: 'text',
            resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
            freeResource: true,
            coverageMeasure: 4,
            depthMeasure: 4
        }
        ],
        CardStatus: "more"
    },

    // {
    //     id: 4,
    //     skill: "In Progress ...."
    // }

]);

/*
Notes:
, CardStatusStore} 
*/

export default CardStoreCopy;