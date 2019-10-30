# Bonuspoints for support
Was another student especially helpful during this project? Give them some free credits 🤩

```
var name = "person who helped you"
boardList.includes(name) ? addMark() : writeName(name)

function calcBonusPoints(name){
    var bonus = (10 - boardPosition) / 10
    bonus = bonus <= 0 ? .1 : bonus
    return (grade >= 5.5 && grade < 10 - bonus) ? bonus : 0
}
```
<!-- Disclaimer: boardlist is constantly sorted based on the number of marks per person; When a bonus(x) would cause the grade(y) to exceed 10(z), it's maxed at x = z - y;-->