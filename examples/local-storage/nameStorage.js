//Get the local storage object
const storage = window.localStorage
const nameInput = document.getElementById('nameInput')
const btn = document.getElementById('submitBtn')
btn.addEventListener("click", storeName)

//Check if theres a stored 'name' value
nameInput.value = checkStorage('name')

//Returns the stored name if it exists, otherwise an  empty string
function checkStorage(prop){
	//Check if it exists
	if (storage.getItem(prop)){
		return storage.getItem(prop)
	}
	return ""
}

//Stores the name
function storeName(){
	let filledInName = document.getElementById('nameInput').value
	console.log(filledInName)
	storage.setItem('name', filledInName)
}

//You can also store more complex info ones it's converted to Strings like so
let data = [{
      id: "257651",
      name: [
        {
          language: "nl",
          value: "Design Ethics"
        }
      ],
      description:
        "Today, designed objects, services and processes surround us: design has the potential to improve or worsen our lives and the world we live in and designers, by playing a key role in the development of this designed world, are in a position to have a significant influence on people, society, culture and the world. Sometimes this influence may not have moral implications, but on occasions it will. The design ethics module will examine this issue by asking and examining possible answers to the following questions:",
      year: "2018-2019",
      credits: 3,
      start: null,
      end: null,
      languages: ["nl"],
      coordinators: 0,
      coordinatorsSummary: "awesome",
      teachers: 0,
      teachersSummary: "awesometeachers",
      competencies: 3,
      competenciesSummary: "research",
      indicators: 0,
      objectivesSummary: "Objective! Over ruled!",
      program: 1,
      faculty: 1
    },
    {
    	blart: "fast"
    }
 ]
storage.setItem("somedata", JSON.stringify(data))
//If you want to retrieve the info you'll have to convert the string back to json
let parsedData = JSON.parse(storage.getItem("somedata"))
//If you want to update some value in localstorage, update the parsed json object
parsedData[0].teachers = ["Laurens", "Danny"]
//Then convert the object back to a string and save it
//Warning: This is not very efficient so avoid storing large strings and updating them often!
storage.setItem("somedata", JSON.stringify(parsedData))
//console.log("The teachers: ", parsedData[0].teachers)