# String Manipulation

This example shows how to use functions to manipulate an array of strings.

The following function takes three parameters, and returns an array where each string has been checked for `oldstring` and been replaced by `newString`.

Here is the explicit version, in ES5 (except for the `for...of` part). The additional checkStringPosition function was created to demonstrate function reuse.
```javascript
function changeStrings(stringArray, oldString, newString){
    var newArray = []
    var currentString = ""
    for (currentString of stringArray){
        var stringIndex = checkifStringExists(oldString, currentString)

        if (stringIndex != -1){
            newArray.push(currentString.slice(0, stringIndex -1) + newString)
        }
        else { 
            console.log("haven't found ", oldString, "replacing with etc.", currentString) 
        }
    }
    return newArray
}
function checkStringPosition(subString, superString){
    return superString.indexOf(subString)
}
changeStrings(["","frontend","htttp://frontend"],"frontend","functional")
```

Here is the ES6 version
```javascript
function changeStrings(stringArray, oldString, newString){ 
    return stringArray.map(item => item.replace(oldString,newString))
}
```

> Disclaimer: This was live coded so it might not be the cleanest example possible. If you see a better way to do this feel free to send a PR :)