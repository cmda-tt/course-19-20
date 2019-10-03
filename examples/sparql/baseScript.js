const el = document.querySelector('p')
const url ="https://api.data.netwerkdigitaalerfgoed.nl/datasets/hackalod/GVN/services/GVN/sparql"
//Note that the query is wrapped in es6 template strings to allow for easy copy pasting
const query = `
PREFIX dct: <http://purl.org/dc/terms/>

SELECT * WHERE {
  ?sub dct:created "1893" .
} LIMIT 1000
`
runQuery(url, query)

function runQuery(url, query){
  //Test if the endpoint is up and print result to page 
  // (you can improve this script by making the next part of this function wait for a succesful result)
  fetch(url)
    .then(res => el.innerText = "Status of API: " + res.status)
  // Call the url with the query attached, output data
  fetch(url+"?query="+ encodeURIComponent(query) +"&format=json")
  .then(res => res.json())
  .then(json => {
  console.log(json)
  console.table(json.results);
  el.textContent = JSON.stringify(json.results)
  })
}