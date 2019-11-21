/*
*	This module takes care of gathering, cleaning, and transforming our data :)
*/
import { mean } from 'd3'

export async function prepareData(url){
  
  //Load the data and return a promise which resolves with said data
	let data = await loadData(url)
  console.log("rawData: ", data)
  //Filter out entries that don't have the main variable we're using
  data = data.filter(entry => filterData(entry, "preference"))
  console.log("filteredData", data)
  //Clean data
	data = data.map(cleanData)
  // console.log("cleanedData: ", data)
  //Transform data for our visualization
	data = transformData(data)
  // console.log("transformedData: ", data)
  return data
}

//Load the data and return a promise which resolves with said data
function loadData(url, query){
  return d3.json(url)
}

//Nest the data per preference (this will be our x-axis value
//Rollup data so we get averages and totals for each variable
//Note: this could also be done when visualizing the values
//			and we could make this pattern more functional by creating a mean and total function
function transformData(source){
  let transformed =  d3.nest()
		.key(d => d.preference)
  	.rollup(d => {
      return {
        amount: d.length,
        brothersAvg: d3.mean(d.map(correspondent => correspondent.brothers)),
        brothersTotal: d3.sum(d.map(correspondent => correspondent.brothers)),
        sistersAvg: d3.mean(d.map(correspondent => correspondent.sisters)),
        sistersTotal: d3.sum(d.map(correspondent => correspondent.sisters)),
        heightAvg: d3.mean(d.map(correspondent => correspondent.height)),
        healthAvg: d3.mean(d.map(correspondent => correspondent.health)),
        stressAvg: d3.mean(d.map(correspondent => correspondent.stress)),
        biggestExpenseAvg: d3.mean(d.map(correspondent => correspondent.biggestExpense)),
        menTotal: d3.sum(d.map(correspondent => correspondent.gender == "Man"? 1: 0)),
        womenTotal: d3.sum(d.map(correspondent => correspondent.gender == "Vrouw"? 1: 0)),
      }
    })
		.entries(source);
  return transformed
}

//Returns true for each row that has something filled in for the given property
function filterData(row, property){
 return (row[property] != "" && row[property] != undefined)
}

//This function returns properly typed properties for our data

function cleanData(row){
  return {
    gender: row.gender,
    brothers: Number(row.brothers),
    sisters: Number(row.sisters),
    height: Number(row.height),
    health: Number(row.health),
    stress: Number(row.stress),
    biggestExpense: Number(row.biggestExpense),
    id: Number(row.id),
    license: row.license,
    //Note that we're selecting here based on first mentioned preference
    //We COULD however, allow duplicate entries so that someone who has 3 prefs
    // ends up in the value array of each of those preferences.
    // To do that, store the entire value and use preference.contains() in the nest function
    preference: row.preference.split(",")[0]
  }
}